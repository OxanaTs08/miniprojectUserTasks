import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true, trim: true },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: [6, "Password must contain at least 6 characters"],
  },
  tasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
  ],
});

export { userSchema };

// userSchema.pre("save', function (next) {
//   if (!this.isModified('password')) {
//     return next();
//   }
//   bcrypt.hash(this.password, 10, (err, hash) => {
//     if (err) {
//       return next(err);
//     }
//     this.password = hash;
//     next();
//   });
// });

const User = mongoose.model("User", userSchema);

export default User;
