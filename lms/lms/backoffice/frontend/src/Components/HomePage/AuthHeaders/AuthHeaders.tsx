export const authHeaders = () => {
    return {
        headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`
        }
    }
}