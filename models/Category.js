const mongoose = require ('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        description: {      //describes the category  
            type: String,
            required: true,
            trim: true
        },
        image: {            //to display listings/menus
            type: String
        },
        slug: {             //url for category page
            type: String,
            unique: true,
            lowercase: true,
            index: true
        },
        metadata: {         //SEO info for category page
            title: String,
            description: String,
            keywords: [String]
        }
    }, {timestamps: true}
);

//autogenerate slug
categorySchema.pre("save", function (next) {
    if (!this.isModified("name")) //do nothing
        return next();
    else    
        this.slug = slugify(this.name, {lower: true, strict: true});
    //next();
});

module.exports = mongoose.model("Category", categorySchema);