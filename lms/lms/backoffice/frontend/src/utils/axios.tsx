import axios from "axios";
// import { authProvider } from "../authProvider";
// import createAuthRefreshInterceptor from "axios-auth-refresh";

const axiosInstance: any = axios.create();
const inactivityTimeout = 30 * 60 * 1000; // 30 minutes duration for inactive application.
let logoutTimer: any;
const startLogoutTimer = () => {
  clearTimeout(logoutTimer);
  logoutTimer = setTimeout(() => {
    // authProvider.logout('');
    window.location.reload();
  }, inactivityTimeout);
};
const resetLogoutTimer = () => {
  startLogoutTimer();
};

const retryWrapper = (axios:any, options:any) => {
  axios.interceptors.response.use(null, (error:any) => {
    console.log(error,"errorrrrrrrrrrr")
    if (error.response.data.message) {
      console.log(error.response.data);
      return error
    }
  })
}
axiosInstance.interceptors.request.use((request: any) => {
  retryWrapper(axiosInstance, {retry_time: 1, retry_status_code: 404})
  let getToken = sessionStorage.getItem("token") || "";
  const token = JSON.parse(getToken);
  if (request.headers) {
    request.headers["Authorization"] = `Bearer ${token}`;
  } else {
    request.headers = {
      Authorization: `Bearer ${token}`,
    };
  }
  resetLogoutTimer();
  return request;
});

const refreshToken: any = sessionStorage.getItem("refresh_token" || "");
const details = {
  params:{
    refresh_token: JSON.parse(refreshToken),
    grant_type : "refresh_token",
  }
}

// const refreshAuthLogic = async(failedRequest: any) =>{
//     await authProvider.login(details).then((tokenRefreshResponse: any) => {
//     let token = sessionStorage.getItem("token");    
//     failedRequest.response.config.headers["Authorization"] = "Bearer " + token;
//     resetLogoutTimer();
//     return Promise.resolve();
//   })
//   .catch((err:any)=>{
//     authProvider.logout('')
//     window.location.reload();
//   });
// }
// createAuthRefreshInterceptor(axiosInstance, refreshAuthLogic,);

export default axiosInstance;