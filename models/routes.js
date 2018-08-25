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
		var prefdata;
		var tdata;
		var hdata;
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
            .limit(1).exec(function(err,data){
               userdata = data;
           }
           );
		await require('./userp.js').find(
            {
				'timestamp' : { $gte : Math.floor(Date.now())-60*60*1000, $lte : Math.floor(Date.now()) }
            }).exec(function(err,pdata){
				var holder = [
					[0,0,0,0,0],
					[0,0,0,0,0],
					[0,0,0,0,0],
					[0,0,0,0,0],
					[0,0,0,0,0],
					];
				for (i = 0; i < pdata.length; i++){
					if (pdata[i].pvalue==-2 && pdata[i].area!= null){
						holder[0][pdata[i].area] += 1;
					}else if (pdata[i].pvalue==-1 && pdata[i].area!= null){
						holder[1][pdata[i].area] += 1;
					}else if (pdata[i].pvalue==0 && pdata[i].area!= null){
						holder[2][pdata[i].area] += 1;
					}else if (pdata[i].pvalue==1 && pdata[i].area!= null){
						holder[3][pdata[i].area] += 1;
					}else if (pdata[i].pvalue==2 && pdata[i].area!= null){ 
						holder[4][pdata[i].area] += 1;
					}
				};
				holder[0][0] = holder[0][1]+holder[0][2]+holder[0][3]+holder[0][4]
				holder[1][0] = holder[1][1]+holder[1][2]+holder[1][3]+holder[1][4]
				holder[2][0] = holder[2][1]+holder[2][2]+holder[2][3]+holder[2][4]
				holder[3][0] = holder[3][1]+holder[3][2]+holder[3][3]+holder[3][4]
				holder[4][0] = holder[4][1]+holder[4][2]+holder[4][3]+holder[4][4]
				prefdata = holder;
           }
           );  
		
		await require('./nodes.js').find(
            {
				'timestamp' : { $gte : Math.floor(Date.now())-60*60*24*7*1000, $lte : Math.floor(Date.now()) }
            }).sort({timestamp:1}).exec(function(err,ndata){
				var tholder = [
					[],
					[],
					[],
					[],
					];
				var hholder = [
					[],
					[],
					[],
					[],
					];
				for (k = 0; k < ndata.length; k++){
					if (ndata[k].Node=="1" && ndata[k].Temp!= null && ndata[k].Humd!= null){
						tholder[0].push([ndata[k].timestamp,ndata[k].Temp]);
						hholder[0].push([ndata[k].timestamp,ndata[k].Humd]);
					}else if (ndata[k].Node=="2" && ndata[k].Temp!= null && ndata[k].Humd!= null){
						tholder[1].push([ndata[k].timestamp,ndata[k].Temp]);
						hholder[1].push([ndata[k].timestamp,ndata[k].Humd]);
					}else if (ndata[k].Node=="3" && ndata[k].Temp!= null && ndata[k].Humd!= null){
						tholder[2].push([ndata[k].timestamp,ndata[k].Temp]);
						hholder[2].push([ndata[k].timestamp,ndata[k].Humd]);
					}else if (ndata[k].Node=="4" && ndata[k].Temp!= null && ndata[k].Humd!= null){
						tholder[3].push([ndata[k].timestamp,ndata[k].Temp]);
						hholder[1].push([ndata[k].timestamp,ndata[k].Humd]);
					}
				};
				tdata = tholder;
				hdata = hholder;
           }
           );   
		   
		
        res.render('profile.ejs', {
       smessage: 'Welcome!',
        user : req.user, // get the user out of session and pass to template
        userp : userdata,
        temparray : temp,
       humdarray : humd,
	   prefarray: prefdata,
		harray: hdata,
		tarray: tdata
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
		var prefdata;
		var tdata;
		var hdata;
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
            .limit(1).exec(function(err,data){
               userdata = data;
           }
           );
				await require('./userp.js').find(
            {
				'timestamp' : { $gte : Math.floor(Date.now())-60*60*1000, $lte : Math.floor(Date.now()) }
            }).exec(function(err,pdata){
				var holder = [
					[0,0,0,0,0],
					[0,0,0,0,0],
					[0,0,0,0,0],
					[0,0,0,0,0],
					[0,0,0,0,0],
					];
				for (i = 0; i < pdata.length; i++){
					if (pdata[i].pvalue==-2 && pdata[i].area!= null){
						holder[0][pdata[i].area] += 1;
					}else if (pdata[i].pvalue==-1 && pdata[i].area!= null){
						holder[1][pdata[i].area] += 1;
					}else if (pdata[i].pvalue==0 && pdata[i].area!= null){
						holder[2][pdata[i].area] += 1;
					}else if (pdata[i].pvalue==1 && pdata[i].area!= null){
						holder[3][pdata[i].area] += 1;
					}else if (pdata[i].pvalue==2 && pdata[i].area!= null){ 
						holder[4][pdata[i].area] += 1;
					}
				};
				holder[0][0] = holder[0][1]+holder[0][2]+holder[0][3]+holder[0][4]
				holder[1][0] = holder[1][1]+holder[1][2]+holder[1][3]+holder[1][4]
				holder[2][0] = holder[2][1]+holder[2][2]+holder[2][3]+holder[2][4]
				holder[3][0] = holder[3][1]+holder[3][2]+holder[3][3]+holder[3][4]
				holder[4][0] = holder[4][1]+holder[4][2]+holder[4][3]+holder[4][4]
				prefdata = holder;
           }
           );   
		
		await require('./nodes.js').find(
            {
				'timestamp' : { $gte : Math.floor(Date.now())-60*60*24*7*1000, $lte : Math.floor(Date.now()) }
            }).sort({timestamp:1}).exec(function(err,ndata){
				var tholder = [
					[],
					[],
					[],
					[],
					];
				var hholder = [
					[],
					[],
					[],
					[],
					];
				for (k = 0; k < ndata.length; k++){
					if (ndata[k].Node=="1" && ndata[k].Temp!= null && ndata[k].Humd!= null){
						tholder[0].push([ndata[k].timestamp,ndata[k].Temp]);
						hholder[0].push([ndata[k].timestamp,ndata[k].Humd]);
					}else if (ndata[k].Node=="2" && ndata[k].Temp!= null && ndata[k].Humd!= null){
						tholder[1].push([ndata[k].timestamp,ndata[k].Temp]);
						hholder[1].push([ndata[k].timestamp,ndata[k].Humd]);
					}else if (ndata[k].Node=="3" && ndata[k].Temp!= null && ndata[k].Humd!= null){
						tholder[2].push([ndata[k].timestamp,ndata[k].Temp]);
						hholder[2].push([ndata[k].timestamp,ndata[k].Humd]);
					}else if (ndata[k].Node=="4" && ndata[k].Temp!= null && ndata[k].Humd!= null){
						tholder[3].push([ndata[k].timestamp,ndata[k].Temp]);
						hholder[3].push([ndata[k].timestamp,ndata[k].Humd]);
					}
				};
				tdata = tholder;
				hdata = hholder;
           }
           );  
		   
        res.render('profile.ejs', {
       smessage: usermsg,
        user : req.user, // get the user out of session and pass to template
        userp : userdata,
        temparray : temp,
       humdarray : humd,
	   prefarray: prefdata,
	   tarray: tdata,
	   harray: hdata
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
			res.setHeader("Access-Control-Allow-Origin", "*");
            require('./nodes.js').find(
            {
                //'Node' : req.params.nodeid,
                'Node' : { $gte : 1, $lte : 4 },
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

    
