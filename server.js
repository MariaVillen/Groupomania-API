// Enviroment Variables
const dotenv = require( "dotenv" );
dotenv.config();

// Database
const sequelize = require( "./utils/database" );
const http = require( "http" );
const app = require( "./app" );

// Normalize Port
const normalizePort = ( val ) => {
  const port = parseInt( val, 10 );

  if ( isNaN( port ) ) {
    return val;
  }
  if ( port >= 0 ) {
    return port;
  }
  return false;
};

const port = normalizePort( process.env.PORT || "3500" );
app.set( "port", port );


// Handle the errors of listening the port.

const errorHandler = ( error ) => {
  if ( error.syscall !== "listen" ) {
    throw error;
  }
  const address = server.address();
  const bind =
    typeof address === "string" ? "pipe " + address : "port: " + port;
  switch ( error.code ) {
    case "EACCES":
      console.error( bind + " requires elevated privileges." );
      process.exit( 1 );
      break;
    case "EADDRINUSE":
      console.error( bind + " is already in use." );
      process.exit( 1 );
      break;
    default:
      throw error;
  }
};

// Server
const server = http.createServer( app );

server.on("error", errorHandler);

server.on("listening", () => {
  const address = server.address();
  const bind = typeof address === "string" ? "pipe " + address : "port " + port;
  console.log("Listening on " + bind);
});

// Syncronize models of DB
sequelize
  .sync({ alter: true })
  .then(() => {
    server.listen(port);
  })
  .catch((err) => {
    console.log(err.message);
  });
