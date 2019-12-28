/**
 * Copyright (c) 2019-present, Paulo Rogério Sales Santos - <paulosales@gmail.com>
 *
 * This source code is licensed under the MIT license found in then
 * LICENSE file in the root directory of this source tree.
 */

const debug = require('debug').debug('crimemap-sync-api');
const readline = require('readline-sync');
const fetch = require('node-fetch');const { ApolloClient } = require('apollo-client');
const { InMemoryCache } = require('apollo-cache-inmemory');
const { HttpLink } = require('apollo-link-http');
const checkServiceUrl = require('../helpers/check-service-url');
const { config } = require('../config');

async function createClient() {
  let serviceUrl;
  while( !serviceUrl ) {
    debug('getting the serviceUrl.')
    serviceUrl = await config.get('serviceUrl');
    debug(`serviceUrl = ${serviceUrl}`);
    if(!serviceUrl) {
      debug('Asking the serviceUrl to user.');
      serviceUrl = readline.question('Please inform the service crime map api url: ');
      
      if(await checkServiceUrl(serviceUrl)) {
        config.set('serviceUrl', serviceUrl);
        await config.save();
        process.stdout.write(`Service url ${serviceUrl} saved.\n`);
      } else {
        process.stdout.write(`The service URL ${serviceUrl} is not valid or the service is not available.\n`);
        process.stdout.write(`Try again or type CTRL + C to cancel.\n`);
        serviceUrl = null;
      }
    } else {
      break;
    }
  }

  const cache = new InMemoryCache();
  const link = new HttpLink({
    uri: serviceUrl,
    fetch
  });

  return new ApolloClient({
    cache,
    link
  });
}

module.exports = createClient
