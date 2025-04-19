const nodeMailer=require("nodemailer");

const sendMail=async (option)=>{
    const transporter=nodeMailer.createTransport({
        host:process.env.EMAIL_HOST,
        port:process.env.EMAIL_PORT,
        auth:{
            user:process.env.EMAIL_USERNAME,
            pass:process.env.EMAIL_PASSWORD
        }
    })

    //email options
    const emailOptions={
        from:"Death support<support@death.com>",
        to:option.email,
        subject:option.subject,
        text:option.message
    }
    await transporter.sendMail(emailOptions)
}

module.exports=sendMail;