import { GRA_ENDPOINT, GRA_KEY, PROXY_ENDPOINT } from "../auth/origins";

export const requestMaking = async (route, method, bodyData) => {
    const url = `${PROXY_ENDPOINT}/${route}`;

    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'endpoint': GRA_ENDPOINT,
        'security_key': GRA_KEY
      },
      body: bodyData ? JSON.stringify(bodyData) : null,
    });
    return response;
}

export const Transaction = async (path, payload) => {
  try {
      const response = await requestMaking(path, 'POST', payload);
      return response.json();
  }
  catch (error) {
      return error;
  }
};

export const verifyTIN = async (tin) => {
    try {
        const response = await requestMaking(`gra/tin/${tin}`, 'GET', null);
        return response.json();
    }
    catch (error) {
        return error;
    }
};

export const verifyGhCardTIN = async (card) => {
  try {
      const response = await requestMaking(`gra/card/${card}`, 'GET', null);
      return response.json();
  }
  catch (error) {
      return error;
  }
};

