// app/routes.js

module.exports = function(app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
        
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {
        //mongoose.connect(configDB.url)
        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });

    // process the login form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {
        //mongoose.connect(configDB.url)
        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    // app.post('/signup', do all our passport stuff here);
	
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
	

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn,
        async (req,res) => {
        var temp = [];
        var humd = [];
        var userdata;
        for (i=1;i<=5;i++){
            try{
                await require('./nodes.js').findOne({'Node' : i.toString()}).sort({timestamp:-1})
                    .exec(function(err,data){
                    if (data != null){
                        temp.push(data.Temp);
                        humd.push(data.Humd);
                    }else{temp.push(null);humd.push(null)}
                   }
                    )       
           }
           catch (error){
           }};
        await require('./userp.js').find({ 'user': req.user.local.email }).sort({timestamp:-1})
            .limit(5).exec(function(err,data){
               userdata = data;
           }
           );    
        res.render('profile.ejs', {
       smessage: 'Welcome!',
        user : req.user, // get the user out of session and pass to template
        userp : userdata,
        temparray : temp,
       humdarray : humd
       })
    }
    )
    


    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
        //mongoose.connection.close();
    });
    
    // =====================================
    // Submit Feedback ==============================
    // =====================================
    
    
    app.post("/profile", isLoggedIn, async (req, res) => {
         var myData = new require('./userp.js')(req.body);
         var usermsg
         await myData.save(
             function(error) {
                usermsg = 'Req Submitted!' + JSON.stringify(req.body)
             if (error) {usermsg = ('Bad Request!' + JSON.stringify(req.body))}
             });
             
        var temp = [];
        var humd = [];
        var userdata;
        for (i=1;i<=5;i++){
            try{
                await require('./nodes.js').findOne({'Node' : i.toString()}).sort({timestamp:-1})
                    .exec(function(err,data){
                    if (data != null){
                        temp.push(data.Temp);
                        humd.push(data.Humd);
                    }else{temp.push(null);humd.push(null)}
                   }
                    )       
           }
           catch (error){
           }};
        await require('./userp.js').find({ 'user': req.user.local.email }).sort({timestamp:-1})
            .limit(5).exec(function(err,data){
               userdata = data;
           }
           );    
        res.render('profile.ejs', {
       smessage: usermsg,
        user : req.user, // get the user out of session and pass to template
        userp : userdata,
        temparray : temp,
       humdarray : humd
       });    
         }
         )

        
    // =========
    // submit temperature, humidity
    // =========       
    app.post('/nodes',
            function(req,res){
            var new_node = new require('./nodes.js')(req.body);
            new_node.save(function(err, task){
                    if (err){
                      res.send(err)};
                    res.json(task);
            })});
    app.get('/nodes/start-time=:start&end-time=:end&nodeid=:nodeid',
            function(req, res) {
            require('./nodes.js').find(
            {
                'Node' : req.params.nodeid,
                'timestamp' : { $gte : req.params.start, $lte : req.params.end }
            }, function(err, task) {
                if (err){
                  res.send(err)};
                res.json(task);});
            });         

     
            
/*     app.get('/test', isLoggedIn, 
    async (req,res) => {
        var temp = [];
        var humd = [];
        var userdata;
        for (i=1;i<=4;i++){
            try{
                await require('./nodes.js').findOne({'Node' : i.toString()}).sort({timestamp:-1})
                    .exec(function(err,data){
                    if (data != null){
                        temp.push(data.Temp);
                        humd.push(data.Humd);
                    }else{temp.push(null);humd.push(null)}
                   }
                    )       
           }
           catch (error){
           }};
        await require('./userp.js').find({ 'user': req.user.local.email }).sort({timestamp:-1})
            .limit(5).exec(function(err,data){
               userdata = data;
           }
           );    
        res.render('test.ejs', {
       smessage: (JSON.stringify(req.body)),
        user : req.user, // get the user out of session and pass to template
        userp : userdata,
        temparray : temp,
       humdarray : humd
       })
    }
    );   */


};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

    
