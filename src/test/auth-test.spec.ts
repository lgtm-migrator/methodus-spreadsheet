var path = require('path');
import { GoogleSpreadsheet } from '../GoogleSpreadsheet';
import { sheet_ids } from './config';
import creds from './service-account-creds';

var _ = require('lodash');



var docs: any = {};
Object.keys(sheet_ids).forEach(function (key) {
  docs[key] = new GoogleSpreadsheet(sheet_ids[key]);
});


function getSheetName() { return 'test sheet' + (+new Date()); }

describe('Authentication', () => {

  beforeAll(() => {
    Object.values(docs).forEach(async (doc: any) => {
      await doc.useServiceAccountAuth(creds);
    });
  });

  describe('without auth', () => {
    describe('reading + getInfo', () => {
      test('getInfo should fail on a private doc', () => {

        return docs['private'].getInfo().catch((err: Error) => {
          expect(err).toContain('The caller does not have permission');
        });

      });

      test('should fail on a private doc', async () => {
        return docs['private'].getRows(1, {}).catch((err: string) => {
          expect(err).toContain('The caller does not have permission');
        });

      });

      ['public', 'public-read-only'].forEach((key: string) => {
        test('reading should succeed on a ' + key + ' doc', async () => {
          const info = await docs[key].getInfo();       
          expect(info.title).toBe(key);
        });      
      });


      describe('writing', () => {
        // it still fails on the public doc because you always need to auth
        _.each(['public', 'public-read-only', 'private'], (key: string) => {
          test('should fail on a ' + key + ' doc', async () => {
            try {
              const sheet = await docs[key].addWorksheet();
              
            } catch (err) {
              expect(err.message).toContain('authenticate');
            }
          });
        });
      });
    });


    xdescribe('authentication', () => {
      test('should fail if the token is empty', async () => {
        try {
          await docs['private'].useServiceAccountAuth({});
        } catch (err) {
          expect(err).toBeDefined();
        }
      });

      //   it('should fail if the key is no good', function (done) {
      //     docs['private'].useServiceAccountAuth({
      //       client_email: 'test@example.com',
      //       private_key: 'not-a-real-key'
      //     }, function (err) {
      //       err.should.be.an.error;
      //       done();
      //     });
      //   });

      //   it('should fail if the email and key do not match', function (done) {
      //     var bad_creds = _.clone(creds);
      //     bad_creds.client_email = 'a' + bad_creds.client_email;
      //     docs['private'].useServiceAccountAuth(bad_creds, function (err) {
      //       err.should.be.an.error;
      //       done();
      //     });
      //   });

      test('should succeed if the creds are valid', async () => {
        let errorExist = false
        try {
          const auth = await docs['private'].useServiceAccountAuth(creds);
        } catch (error) {
          errorExist = true;
        }

        expect(errorExist).toBeFalsy();

      });

      test('should accept a string which is a path to the file', async () => {
        let errorExist = false
        try {

          var creds_file_path = path.resolve(process.cwd() + '/service-account-creds.json');
          docs['private'].useServiceAccountAuth(creds_file_path);
        } catch (error) {
          errorExist = true;
        }
        expect(errorExist).toBeFalsy();

      });

      //   it('should fail if the path is invalid', function (done) {
      //     var creds_file_path = path.resolve(__dirname + '/doesnt-exist.json');
      //     docs['private'].useServiceAccountAuth(creds_file_path, function (err) {
      //       err.should.be.an.error;
      //       done();
      //     });
      //   });
    });


    xdescribe('with auth', () => {


      _.each(['public', 'public-read-only', 'private'], (key: string) => {
        test('getInfo should succeed on a ' + key + ' doc', async () => {
          const info = await docs[key].getInfo();
          expect(info).toBeDefined();
        });
      });

      //     it('reading data succeed on a ' + key + ' doc', function (done) {
      //       docs[key].getRows(1, function (err, rows) {
      //         (err == null).should.be.true;
      //         rows.should.be.an.array;
      //         done();
      //       });
      //     });
      //   });

      //   _.each(['public', 'private'], function (key) {
      //     it('writing should succeed on a ' + key + ' doc', function (done) {
      //       docs[key].addWorksheet(function (err, sheet) {
      //         (err == null).should.be.true;
      //         sheet.del(done);
      //       });
      //     });
      //   });

      //   it('writing should fail if user does not have access', async (done) => {
      //     const sheet = await docs['public-read-only'].addWorksheet();
      //   });
    });

  });
});