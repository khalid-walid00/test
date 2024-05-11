const express = require('express');
require('dotenv').config();
const graphqlHTTP = require('express-graphql').graphqlHTTP;
const { buildSchema } = require('graphql');
const cors = require('cors');
const bcrypt = require("bcrypt")
const UserModule = require('./module/Users');
require ('./config/db');
const app = express();
const Jwt = require("jsonwebtoken");
const PostModule = require('./module/Posts');
app.use(cors({
    origin: '*',
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST'],
}));

const schema = buildSchema(`
  type User {
    id: Int
    name: String
    email: String
    token:String
  }
  type Post {
    title:String
    name:String
  }
  type Query {
    hello: String,
    users: [User],
    userById(id: Int!): User
    LoginUser(email:String,password:String):User
    GetPostsById(userId:String!):[Post]
  }
  type Mutation {
    registerUser(name: String!, email: String!, password: String!): User,
    createPost(title:String!,userId:String!):Post
    UpdatePost(PostID:String!,title:String):Post
    DeletePost(PostID:String!):String
  }
`);

const auth = {
  registerUser:async ({name,email,password})=>{
      console.log(name,email,password)
       const slat = await bcrypt.genSalt(10)
       const passwordHash = bcrypt.hashSync(password,slat) 
       const currentUser =await UserModule.findOne({email})

      if(currentUser)  throw Error ("user not found")  
        const user = new UserModule({name,email,password:passwordHash})
      await user.save()       
      const payload=user._id
      const token = Jwt.sign({payload},process.env.SECKRET_Key) 
      if(!token) throw Error ("dont have token")
      return {token,email:user.email,name:user.name}
  } ,
  LoginUser: async (args) => {
    const { password, email } = args
    const user = await UserModule.findOne({ email: email })
    if(!user ) throw new Error ('Invalid Credentials email')
    const isMatach =  bcrypt.compareSync(password, user.password)
    if(!isMatach) throw new Error ('Invalid Credentials password')
    const payload = user._id
    const token = Jwt.sign({payload}, process.env.SECKRET_Key, { expiresIn: '2h' })
    if (!token) {
        return { msg: 'Dont token' }
    }
    return {token,email:user.email,name:user.name}

},
};
const Posts={
  createPost:async ({title,userId})=>{
    const post = new PostModule({title,userId})
    await post.save()  
    const UserForPost = await UserModule.findById(userId)
    const PostNew = {
     name:UserForPost.name,
     title
    }
     return PostNew
  },
  GetPostsById:async ({userId})=>{
    console.log(userId)
    const PostForUser = await PostModule.find({userId}).populate('userId')
     const Posts = PostForUser.map((post)=>({...post,name:post.userId.name}))
     console.log(Posts)
     return Posts
  },

  UpdatePost:async (args)=>{    

const New =await PostModule.findByIdAndUpdate(args.PostID,{title:args.title}).populate('userId')
 
return {title:New.title,name:New.userId.name}
  },

  DeletePost:async (args)=>{    
    const New =await PostModule.findByIdAndDelete(args.PostID)
    return "delete success"
      },
}
const resolver = {
  ...auth,
  ...Posts
};

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: resolver,
  graphiql: true
}));

app.listen(3000, () => console.log('Now browse to http://localhost:3000/graphql'));
