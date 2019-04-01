export = Twitter;

interface TwitterOptions {
  subdomain: string;
  consumer_key: string;
  consumer_secret: string;
  access_token_key: string;
  access_token_secret: string;
}

declare class Twitter {
  constructor(options: TwitterOptions);

  authType: any;
  client: any;
  token: any;
  url: any;
  oauth: any;
  config: any;
  get(e: any, t: any): Promise<any>;
  getAccessToken(e: any): any;
  getBearerToken(): any;
  getRequestToken(e: any): any;
  post(e: any, t: any): Promise<any>;
  stream(e: any, t: any): any;
}

declare interface KbTwitter {

}
