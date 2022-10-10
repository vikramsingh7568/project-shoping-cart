


const loginUser = async function(req,res){
    try{

        const data = req.body
        const email=data.email;
        email.toLowerCase();
        let password = data.password;
        if(Object.keys(data).length==0){
            return res.status(400).send({status:false,msg:"Please Enter email and Password"})

        }
        if(!email){
            return res.status(400).send({status:false,msg:"Please Enter email"})
        }
        if(!password){
            return res.status(400).send({status:false,msg:"Please Enter password"})
        }
        const user =  await userModel.findOne({email:email,password:password})
        if(!user){
            return res.status(401).send({status:false,msg:"Invalid User"})

        }

// Creating Token Here

let token = await jwt.sign({ id: user._id.toString() }, "FunctionUp-Group-55-aorijhg@#", { expiresIn: '2hr' })
res.header({ "x-api-key": token })
        return res.status(200).send({status:true,msg:"User LoggedIn Succesfully",data:{userId:user._id,token:token}})

    }
    catch(err){
        return res.status(500).send({status:false,msg:err.message})
    }
}
