var mongoose = require('mongoose');
var Schema = mongoose.Schema

var PostSchema = new Schema({
    title: {type:String, required:true, maxlength:100},
    content: {type:String, required:true},
    linkFlairID: {type:Schema.Types.ObjectId, ref: 'LinkFlair'},
    postedBy: {type:Schema.Types.ObjectId, ref: 'User', required:true},
    // postedBy: {type:String, required:true},
    postedDate: {type:Date, default:Date.now},
    commentIDs: [{type:Schema.Types.ObjectId, ref: 'Comment'}],
    views: {type:Number, required:true, default: 0},
    type: {type:String, default:'post'},
    votes: {type:Number, default:0}
});

PostSchema.virtual("url").get(function(){
    return `posts/${this._id}`;
})

PostSchema.set("toJSON", {virtuals: true});

module.exports = mongoose.model("Post", PostSchema);