import ContentEditPage from "./contentEditPage";
import CourseEditPage from "./courseEditPage";


const EditPage = ({ entity, setIsEdit }: any) => {
    if (entity?.contentType === "course") {
        return (
            <CourseEditPage chapterId={entity} setIsEdit={setIsEdit} />
        )
    } else {
        return (
            <ContentEditPage chapterId={entity} setIsEdit={setIsEdit} />
        )
    }
}
export default EditPage;