import { MethodConfig, Method, Param, Query, Auth, AuthType, MethodResult, Body } from '@methodus/server';
import { Verbs } from '@methodus/platform-rest';
import { SheetInfo, WebResponse } from './interfaces';
import { JWT } from 'google-auth-library';
//const GoogleAuth = require('google-auth-library');



@Auth(AuthType.BearerToken, async function (_options: any) {
    const caller: any = this as any;
    //const _auth_client = new GoogleAuth();
    if (caller.auth_mode === 'jwt') {
        if (!caller.google_auth || caller.google_auth.expires < +new Date()) {
            await caller.renewJwtAuth();
        }
        if (caller.google_auth) {
            if (caller.google_auth.type === 'Bearer') {
                return 'Bearer ' + caller.google_auth.value;
            }
            else {
                return 'GoogleLogin auth=' + caller.google_auth;
            }
        }
    }
    return '';
})
@MethodConfig('GoogleSheetContract')
export class GoogleSheetContract {

    auth_mode: any;

    @Method(Verbs.Get, '/:ss_key/values/:range')
    async getRows(@Param('ss_key') _ss_key: string, @Param('range') _range: string, @Query() _query: any) {

    }

    @Method(Verbs.Get, '/:ss_key/values/:range')
    async getHeaderRow(@Param('ss_key') _ss_key: string, @Param('range') _range: string) : Promise<MethodResult<any>> {

        return new MethodResult<any>({});
    }

 

    @Method(Verbs.Post, '/:ss_key:batchUpdate')
    async batchUpdate(@Param('ss_key') _ss_key: string, @Body() _body: any): Promise<MethodResult<WebResponse>> {

        return new MethodResult<any>({});
    }


    @Method(Verbs.Get, '/:ss_key')
    async getInfo(@Param('ss_key') _ss_key: string): Promise<MethodResult<SheetInfo>> {
        const sheetInfo: SheetInfo = new SheetInfo({ title: 'contract', worksheets: [], id: 'xxxxx' });
        return new MethodResult<SheetInfo>(sheetInfo);
    }

    setAuthToken(auth_id: any) {
        if (this.auth_mode == 'anonymous') this.auth_mode = 'token';
        this.setAuthAndDependencies(auth_id);
    }

    setAuthAndDependencies(auth: any) {
        this.google_auth = auth;
        // if (!this.options.visibility) {
        //     this.visibility = this.google_auth ? 'private' : 'public';
        // }
        // if (!this.options.projection) {
        //     this.projection = this.google_auth ? 'full' : 'values';
        // }
    }
    google_auth: any;
    visibility?: string;
    jwt_client: any;
    async renewJwtAuth() {
        this.auth_mode = 'jwt';
        const credentials = await (this.jwt_client as JWT).authorize();
        this.setAuthToken({
            type: credentials.token_type,
            value: credentials.access_token,
            expires: credentials.expiry_date
        });
    }


}