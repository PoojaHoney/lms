import { useEffect, useState } from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./quillEditor.css";

export const EditorModules = {
  toolbar: [
    [{ font: [] }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    ["blockquote", "code-block"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }, { align: [] }],
    ["link", "image", "video"],
    ["clean"],
  ],
};

const PlainEditor = (props: any) => {
  const [editorData, setEditorData] = useState<any>("");
  useEffect(() => {
    if (props.value == undefined || props.value.length == 0) {
      setEditorData("");
    } else if (props?.value?.pageContent) {
      setEditorData(props?.value?.pageContent);
    } else {
      setEditorData(props.value);
    }
  }, []);
  return (
    <>
      <ReactQuill
        className="quillEditor-container"
        modules={EditorModules}
        value={editorData}
        theme="snow"
        placeholder="Type the Content..."
        onChange={(e: any) => {
          setEditorData(e);
          props.onChange?.(e);
        }}
      />
    </>
  );
};

export default PlainEditor;
