var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CommentSchema = new Schema({
    content: {type:String, required:true, maxlength:500},
    commentIDs: [{type:Schema.Types.ObjectId, ref: 'Comment'}],
    commentedBy: {type:Schema.Types.ObjectId, ref: 'User', required:true},
    // commentedBy: {type:String, required:true},
    commentedDate: {type:Date, default:Date.now},
    type: {type:String, default:'comment'},
    votes: {type:Number, default:0}
});

CommentSchema.virtual("url").get(function () {
    return `comments/${this._id}`;
});

CommentSchema.set("toJSON", {virtuals:true});

module.exports = mongoose.model("Comment", CommentSchema);