const nodemailer = require('nodemailer');

// const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         user: 'sandaud7551@gmail.com',
//         pass: ''
//     }
// });

// const options = {
//     from: 'sandaud7551@gmail.com',
//     to: 'sandeep.19je0741@me.iitism.ac.in',
//     subject: 'Test Email from NodeMailer',
//     text: 'An experiment for indulge_squad_z'
// }

// transporter.sendMail(options, (err, info) => {
//     if(err) console.log(err);
//     else console.log(info.response);
// });





//===================================================
function sendMail(toEmail) {
    let toEmail = 'sandeep.19je0741@me.iitism.ac.in';
    var smtpTransport = nodemailer.createTransport(
        "smtps://sandaud7551%40gmail.com:"+encodeURIComponent('ska755dog') + "@smtp.gmail.com:465");
                var mailOptions = {
                    to: toEmail,
                    from: 'sandaud7551@gmail.com',
                    subject: 'INF filled',
                    text: `This is to notify that, Amazon has filled the INF for the Academic Year 2023\nKindly review the form for further steps.\n\n
                    Please visit the below link for viewing the Form\n
                    https://indulge-squad-z.herokuapp.com/
                    `
                };
                smtpTransport.sendMail(mailOptions, function(err) {
                    // req.flash('success_message', 'An e-mail has been sent to ' + toEmail + ' with further instructions.');
                    // done(err, 'done');
                    if(err) console.log(err);
                    else {
                        console.log('An e-mail has been sent to ' + toEmail + ' with further instructions.');
                    }
                });
}