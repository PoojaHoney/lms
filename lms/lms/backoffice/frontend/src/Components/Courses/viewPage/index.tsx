import ContentViewPage from "./contentViewPage"
import CourseViewPage from "./courseViewPage"

const ViewPage = ({ entity, setIsEdit }: any) => {
    if (entity?.contentType === "course") {
        return (
            <CourseViewPage chapterId={entity} setIsEdit={setIsEdit} />
        )
    } else {
        return (
            <ContentViewPage chapterId={entity} setIsEdit={setIsEdit} />
        )
    }
}
export default ViewPage;