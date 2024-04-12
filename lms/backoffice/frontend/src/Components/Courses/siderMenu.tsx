import { Menu, Spin, Tooltip } from "antd";
import React, { useState } from "react";
import type { MenuProps } from "antd";
import {
  AppstoreOutlined,
  MailOutlined,
  SettingOutlined,
} from "@ant-design/icons";
// import { FileOutlined } from "@ant-design/icons";
import { courseItems } from "./coursesMockData";
import {
  FileOutlined,
  CaretRightOutlined,
  CaretDownOutlined,
} from "@ant-design/icons";
import {
  PlusSquareOutlined,
  FilterOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import "./coursesPage.css";
import { PiTreeStructureDuotone } from "react-icons/pi";

const SiderMenu = ({
  handleBackToCourse,
  courseData,
  courseProgress,
  menuItems,
  fetchLessonItem,
  chapterId,
  setChapterId,
  setIsEdit,
  handleSubMenuClick,
  handleMenuItemClick,
  selectedSubmenuIndex,
  selectedMenuItemIndex,
}: any) => {
  // console.log(menuItems, "menuItemss--iii");
  return (
    <div className="course_sideBar_menu_container">
      {menuItems && menuItems?.length > 0 ? (
        <Menu
          mode="inline"
          // openKeys={[
          //   menuItems[selectedSubmenuIndex]?.key,
          //   menuItems[selectedSubmenuIndex]?.children[
          //     selectedMenuItemIndex
          //   ]?.key,
          // ]}
          // selectedKeys={[
          //   menuItems[selectedSubmenuIndex]?.key,
          //   menuItems[selectedSubmenuIndex]?.children[
          //     selectedMenuItemIndex
          //   ]?.key,
          // // ]}
          // defaultSelectedKeys={[
          //   menuItems[0]?.key]}
          // defaultOpenKeys={[menuItems[0]?.key]}
          className="courses-menubar"
          onClick={() => setIsEdit(false)}
        >
          {menuItems.map((item: any, subMenuIndex: any) => (
            // <Tooltip title={item?.label} >
            <Menu.SubMenu
              key={item?.key}
              onTitleClick={(e: any) => {
                // if (e.key !== chapterId.selectedId) {

                // }
                fetchLessonItem(e?.key, subMenuIndex);
                setChapterId({
                  ...chapterId,
                  showModal: false,
                  courseId: item?._id,
                  selectedCourseIndex: subMenuIndex,
                  selectedId: item?._id,
                  chapterId: "",
                  contentType: "course",
                });
              }}
              title={
                <div className="courses_menu_titleBar" >
                  {/* <div>
                    {item.label} 
                  </div> */}
                  <Tooltip  placement="rightTop"  title={`Course: ${item?.label}`}>
                    <div className="content_title"  >
                      {item.label?.slice(0, 15) || item.label.slice(0, 15)}
                      {item.label.length > 15 || item.label?.length > 15
                        ? "..."
                        : ""}
                    </div>
                  </Tooltip>
                  <Tooltip  title={`Total Chapters: ${item?.chaptersCount}`}>
                    <div>
                      <PiTreeStructureDuotone />
                      {item?.chaptersCount}
                    </div>
                  </Tooltip>
                  <Tooltip  placement="right" title="Add New Chapter">
                    <div
                      onClick={(e: any) => {
                        // console.log(e, "event---typee", item, "courseData");
                        e.stopPropagation();
                        setChapterId({
                          ...chapterId,
                          showModal: true,
                          courseId: item?._id,
                          selectedId: item?._id,
                          selectedCourseIndex: subMenuIndex,
                          contentType: "chapter",
                        });
                      }}
                      style={{ color: "#0290F9" }}
                    >
                      Add
                    </div>
                  </Tooltip>
                </div>
              }
            // icon={<FileOutlined />}
            // title={item?.label}
            // onTitleClick={() => handleSubMenuClick(subMenuIndex)}
            >
              {item?.children?.map((childItem: any, itemIndex: any) => (
                <Menu.Item
                  key={childItem.key}
                  // icon={
                  //   childItem?.lessonStatus === true ? (
                  //     <div>dummy</div>
                  //   ) : (
                  //     childItem?.icon
                  //   )
                  // }
                  onClick={() => {
                    setChapterId({
                      ...chapterId,
                      showModal: false,
                      contentType: "chapter",
                      courseId: item?._id,
                      selectedCourseIndex: subMenuIndex,
                      chapterId: childItem?.chapterId,
                      selectedId: childItem?.chapterId,
                      selectedChapterIndex: itemIndex,
                    });
                  }}
                >
                  <Tooltip  placement="rightTop"  title={`Chapter: ${childItem?.label}`} >
                    {childItem?.label}
                  </Tooltip>
                </Menu.Item>
              ))}
            </Menu.SubMenu>
            // </Tooltip>
          ))}
        </Menu>
      ) : (
        <div className="course_sideBar_spinner">
          <Spin size="large" />
        </div>
      )}
    </div>
  );
};

export default SiderMenu;
