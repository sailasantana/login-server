const express = require( 'express' );
const knex = require( 'knex' );
const { LoginService } = require( './login-service'); 
const app = express();
const jsonParser = express.json();
const jwt = require( 'jsonwebtoken' );
const cors = require( 'cors' );
const bcrypt = require( 'bcrypt' );

const database = knex({
    client : 'pg',
    connection : 'postgresql://alfredosalazar@localhost/login'
});

app.use( cors() );

app.post( '/api/login', jsonParser, ( req, res ) => {
    const { username, password } = req.body;
    const user = {
        username
    };

    LoginService
        .getUser( database, user )
        .then( result => {
            if( ! result ){
                res.statusMessage = "That user doesn't exist.";
                return res.status( 404 ).end();
            }

            const sessionObj = {
                username : result.username,
                firstName : result.firstname,
                lastName : result.lastname
            };

            console.log( sessionObj );
            bcrypt.compare( password, result.password )
                .then( result => {
                    if( result ){
                        jwt.sign( sessionObj, 'secret', { expiresIn : '1m' }, ( err, token ) => {
                            if( ! err ){
                                return res.status( 200 ).json( { token } );
                            }
                            else{
                                res.statusMessage = "Something went wrong with the generation of the token.";
                                return res.status( 406 ).end();
                            }
                        });
                    }
                    else{
                        return res.status( 401 ).json( "Your credentials are wrrong!");
                    }
                })
        });
});

app.get( '/api/validate', ( req, res ) => {
    const { session_token } = req.headers;
    console.log( req.headers );
    jwt.verify( session_token, 'secret', ( err, tokenDecoded ) => {
        if( err ){
            res.statusMessage = "Not authorized.";
            return res.status( 401 ).end();
        }
        else{
            console.log( tokenDecoded );
            return res.status( 200 ).json({
                message : `Welcome back ${tokenDecoded.firstName} ${tokenDecoded.lastName}!`
            });
        }
    });
});

app.post( '/api/signup', jsonParser, ( req, res ) => {
    const { username, password, firstname, lastname } = req.body;

    bcrypt.hash( password, 10)
        .then( hashPassword => {
            const newUser = {
                username,
                password : hashPassword,
                firstname,
                lastname
            };

            LoginService
                .addUser( database, newUser )
                .then( result => {
                    return res.status(201).json( result );
                })
        });
});

app.listen( 8080, () => {
    console.log( "Running in port 8080" );
});