var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CommunitySchema = new Schema({
    name: {type: String, required: true, maxlength: 100},
    description: {type: String, required: true, maxlength: 500},
    postIDs: [{type: Schema.Types.ObjectId, ref: 'Post'}],
    startDate: {type: Date, default: Date.now},
    members: [{type:Schema.Types.ObjectId, ref: 'User'}],
    createdBy: {type:Schema.Types.ObjectId, ref: 'User', required:true},
    // members: [{type:String}],
});

CommunitySchema.virtual("url").get(function () {
    return `communities/${this._id}`;
  });
  
CommunitySchema.virtual("memberCount").get(function () {
return this.members.length;
});
  
CommunitySchema.set("toJSON", {virtuals: true});

module.exports = mongoose.model("Community", CommunitySchema);