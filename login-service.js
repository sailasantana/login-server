
const LoginService = {
    getUser( db, user ){
        return db
                .select( '*' )
                .from( 'users' )
                .where( user )
                .then( result => {
                    return result[0];
                })
    },
    addUser( db, newUser ){
        return db( 'users' )   
                .insert( newUser )
                .returning( '*' )
                .then( result => {
                    return result[0]
                })
    }
};


module.exports = { LoginService };