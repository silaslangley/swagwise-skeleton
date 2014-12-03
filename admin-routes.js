module.exports = function(app) {

    // Require mongoose dependency
    var mongoose = require('mongoose');

    /* Add the dependency to passport after the mongoose require decleration */
    var passport = require('passport');

    /* Add the dependency to Stripe */
    var stripe   = require('stripe')('sk_test_MPZw5Of5EjrfHaAM789HgPUc');

    /* ======================= MIDDLEWARE ====================== */

    app.use('/api/admin', passport.authenticate('local'), function(req, res) {

        console.log('the request %j', req);
        
        if (req.user.isAdmin) {
            next();
        } else {
            res.send({
                status: 400,
                message: 'Access Denied' 
            });
        }

    });

    /* ======================= REST ROUTES ====================== */
    // Handle API calls

    // Swag API route
    app.route('/api/admin/products')
        .get(function(req, res) {

            var filter = {
                isActive: true
            };

            if (req.query.isFeatured) {
                filter.isFeatured = typeof req.query.isFeatured == 'boolean' ? req.query.isFeatured : true;
            }

            // use mongoose to get all products in the database
            mongoose.model('Product').find(filter, function(err, swag) { //anything on the query string, express will turn into a query string object as two lines below
                

                //http://localhost:9001/api/swag/?isFeatured=true&foo=bar&ninja=false
                // req.query = {isFeatured: true, foo: bar, ninja: false}

                // if there is an error retrieving, send the error. nothing after res.send(err) will execute
                if (err)
                    res.send(err);

                res.send(swag); // return products in JSON format
            });
        });

    app.route('/api/admin/products/:id')
        .get(function(req, res) {
            // use mongoose to get a product in the database by id
            mongoose.model('Product').findOne({id: req.params.id}, function(err, product) {
                // if there is an error retrieving, send the error. nothing after res.send(err) will execute
                if (err)
                    res.send(err);

                res.send(product); // return the product in JSON format
            });
        });



    /* Add the following routes after the products routes */
    // logout API route
    app.get('/api/logout', function(req, res, next) {
        req.logout();
        res.send(200);
    });

    // login API route
    app.post('/api/login', passport.authenticate('local'), function(req, res) {
        res.cookie('user', JSON.stringify(req.user));
        res.send(req.user);
    });

    // signup API route
    app.post('/api/register', function(req, res, next) {
        var User = mongoose.model('User');
        var email = req.body.email;

        // Create a customer
        stripe.customers.create({

            email: email

        }, function(err, customer){

            if(err) return next(err);

            var user = new User({
                email: email,
                password: req.body.password,
                customer_id: customer.id
            });

            user.save(function(err) {
                if (err) return next(err);

                res.send(200);
            });

        });
    });

    app.route('/api/admin/users');

    app.route('api/admin/users/:id');
  
};