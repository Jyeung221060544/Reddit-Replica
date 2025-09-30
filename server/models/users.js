var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    firstName: {type:String, required:true}, 
    lastName: {type:String, required:true},
    communityIDs: [{type:Schema.Types.ObjectId, ref:'Community'}],
    postIDs: [{type:Schema.Types.ObjectId, ref:'Post'}],
    commentIDs: [{type:Schema.Types.ObjectId, ref:'Comment'}],
    startDate: {type:Date, required:true},
    reputation: {type:Number, default:100},
    displayName: {type:String, required:true}, 
    email: {type:String, required:true},
    hashPassword: {type:String, required:true},
    isAdmin: {type:Boolean, default:false},

    upvotedComments : [{type:Schema.Types.ObjectId, ref:'Comment'}],
    downvotedComments : [{type:Schema.Types.ObjectId, ref:'Comment'}],
    upvotedPosts : [{type:Schema.Types.ObjectId, ref:'Post'}],
    downvotedPosts : [{type:Schema.Types.ObjectId, ref:'Post'}]
});

UserSchema.virtual("url").get(function(){
    return `users/${this._id}`;
})

UserSchema.set("toJSON", {virtuals: true});

module.exports = mongoose.model("User", UserSchema);