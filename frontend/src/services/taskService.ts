import api from "../utils/interceptor/interceptor";

type TaskData = {
    title: string;
    description: string;
};

type TaskListParams = {
    page?: number;
    limit?: number;
    search?: string;
    isComplete?: boolean;
};

const taskService = {

    create: async (data: TaskData) => await api.post("/tasks", data),

    update: async (id: string, data: TaskData) => await api.put(`/tasks/${id}`, data),

    delete: async (id: string) => await api.delete(`/tasks/${id}`),

    changeStatus: async (id: string, complete: boolean) => await api.patch(`/tasks/change-status`, {}, {
        params: {id, complete},
    }),

    getList: async (params: TaskListParams) => await api.get("/tasks/list", {params}),

    getById: async (id: string) => await api.get(`/tasks/${id}`),

    getStats: async () => await api.get(`/tasks/stats`)

};

export default taskService;
