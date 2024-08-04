import axios from "axios"

const apiClient=axios.create({
    baseURL:"https://api.spotify.com/v1/",
});

export const setClientToken=(token)=>
{
    apiClient.interceptors.request.use(async function (config){
        config.headers.Authorization=`Bearer ${token}`;
        return config;
    })
}

export default apiClient