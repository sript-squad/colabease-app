import { Amplify } from "aws-amplify";

Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: "us-east-1_ph5X61JFW",
            userPoolClientId: "4a617s1bufnjprpgup30ir2c39",
            loginWith: {
                oauth: {
                    domain: "us-east-1ph5x61jfw.auth.us-east-1.amazoncognito.com",
                    scopes: [],
                    redirectSignIn: ["http://localhost:5173/callback"],
                    redirectSignOut: ["http://localhost:5173"],
                    responseType: "code"
                }
            }
        }
    }
}); 