import axios from "axios";
import axiosInstance from "./axios";

export const fetchWith = () => {
    
}

const CONTENT_API_URL: any = process.env.REACT_APP_CONTENT_API;

export const fetchData = async (url: string) => {
    try {
      const res = await axiosInstance.get(url);
      if (res.status === 200) {
        return res.data.data || res.data;
      } else {
        throw new Error(res);
      }
    } catch (err) {
      console.log("Eresroor: ", err);
      new Error("Some error");
    }
  };

  export const uploadCSVFileHandler = async (
    file: any,
    itemId: any,
    entityModule: any
  ) => {
    // const siteID = sessionStorage.getItem(CURRENT_SITEID);
    // const langID: any = sessionStorage.getItem(STORE_LANG_CODE);
    const fmData = new FormData();
    const config = {
      headers: { "content-type": "multipart/form-data" },
    };
    fmData.append("file", file);
    try {
      const res = await axiosInstance.post(
        `${CONTENT_API_URL}/${entityModule}//${itemId}/epg`,
        fmData,
        config
      );
      if (res.status == 200) {
        return res;
      }
      return "";
    } catch (err) {
      console.log("Error: ", err);
      const error = new Error("Some error");
    }
  };
  export const GetFileUrl = async (file: any, type: any, module: any) => {
    // To-Do-updateSiteIDInContext
    // const siteID = sessionStorage.getItem(CURRENT_SITEID);
    const fmData = new FormData();
    const config = {
      headers: { 'Content-Type': 'multipart/form-data', "Authorization": `Bearer ${sessionStorage.getItem('token')}` },
  };
    fmData.append("file", file);
    try {
      // let API_URL: string = process.env.REACT_APP_CONTENT_API;
      let BASE_API_URL: any = process.env.REACT_APP_CONTENT_API;
      // const langID: any = sessionStorage.getItem(STORE_LANG_CODE);
      const res = await axios.post(
        `${BASE_API_URL}/upload?type=${type}`,
        fmData,
        config
      );
      console.log(res, "res--009")
      if (res.status == 201) {
        return res.data.data;
      }
      return "";
    } catch (err) {
      console.log("Eresroor: in upload ", err);
      const error = new Error("Some error");
    }
  };
 export const GetImageUrl = async (file: any) => {
    const fmData = new FormData();
    const config = {
        headers: { 'Content-Type': 'multipart/form-data', "Authorization": `Bearer ${sessionStorage.getItem('token')}` },

    };
    fmData.append("file", file);
    let folder = "";
    try {
        let BASE_API_URL: any = process.env.REACT_APP_CONTENT_API;
        let res: any = await axios
            .post(
                `${BASE_API_URL}/upload?type=posterimage`,
                fmData,
                config,
            )
            .then((res: any) => {
                //   let data = [...(res.data.data || [])];
            });
        if (res.status == 201) {
            return res.data;
        }
        return "";
    } catch (err) {
        console.log("Error: ", err);
        const error = new Error("Some error");
    }
};