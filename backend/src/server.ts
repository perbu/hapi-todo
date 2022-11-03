import Hapi from "@hapi/hapi";
import { Server } from "@hapi/hapi";


export const init =  (): Server => {
  console.log("init");
  let server = Hapi.server({
    port: process.env.PORT || 4000,
    host: '0.0.0.0'
  });

  return server;
};


