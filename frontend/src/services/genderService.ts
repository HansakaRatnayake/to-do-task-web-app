import api from "../utils/interceptor/interceptor.ts";



const genderService = {

    getList: async () => {
        return await api.get("/genders/list");
    },
    getById: async (id:string) => {
        return await api.get(`/genders/${id}`);
    }

}

export default genderService;

