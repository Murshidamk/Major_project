import Config from "./Config";

// function to make rest call
const CallApi = async (endpoint, headers, ...callbacks) => {
    let response = await fetch(endpoint, headers);
    let jsonResponse = await response.json();
    callbacks.map(callback => (response.ok) ?
        callback(true, jsonResponse) : callback(false, null));
}

// function to get endpoint uri
const GetEndpointURI = (name, param, value) => {
    let uri = Config.endpointPrefix + Config.endpoints.find(endpoint => endpoint.name === name).uri;
    if (param && value) {
        return uri.replace(param, value);
    } else {
        return uri;
    }
}

// function to get headers
const GetHttpHeaders = (httpMethod, accessToken, content) => {
    let settings = {
        method: httpMethod,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            authorization: accessToken
        },
        body: content
    };
    if(!settings.headers.authorization)
        delete settings.headers.authorization;
    if(!settings.body)
        delete settings.body;
    return settings;
}

export {GetEndpointURI, GetHttpHeaders, CallApi};