import { Collapse, message, Typography, Row, Col, Avatar, Input, Button, Modal, Form, List, Dropdown, Divider, Tag, Select, Upload, Tooltip, Space } from "antd"
// import './css/Dashboard.css';
import { useEffect, useState } from "react";
import { CheckCircleOutlined, SaveOutlined, EyeOutlined, DownOutlined, LoadingOutlined, UploadOutlined, PlusOutlined, EditOutlined, DownloadOutlined, DeleteOutlined, UserAddOutlined, RightOutlined, FilterOutlined, SearchOutlined } from "@ant-design/icons";
import type { MenuProps, UploadFile } from 'antd';
import axios from "axios";
import { authHeaders } from "../AuthHeaders/AuthHeaders";
import './Users.css'
import { RcFile, UploadProps } from "antd/es/upload";
import type { UploadChangeParam } from 'antd/es/upload';
import ImageUploadWidget from "../../widgets/imageUploadWidget";
import UploadCSVFile from "../../widgets/uploadCSVFile";
import { read, utils, writeFile } from "xlsx";
import Table, { ColumnsType } from "antd/es/table";

const { Title, Paragraph, Text, Link } = Typography;

const Users = () => {
    const [aUsers, setUsers] = useState([])
    const [modal1Open, setModal1Open] = useState(false);
    const [modalMultiUsersOpen, setModalMultiUsersOpen] = useState(false);
    const [oDisplayForm, setDisplayForm] = useState<any>()
    const [oUserSelect, setUserSelect] = useState(true)
    const [sUserSelectedid, setUserSlectedId] = useState("")
    const [bDeleteLoading, setDeleteLoading] = useState(false)
    const [oDisplayFormMode, setDisplayFormMode] = useState<string>("Display")
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [sSearchVal,setSearchVal] = useState('')
    const [imageUrl, setImageUrl] = useState<string>();
    const { Option } = Select;
    const layout = {
        labelCol: { span: 9 },
        wrapperCol: { span: 16 },
    };
    const [oForm] = Form.useForm()
    const [oUserEditForm] = Form.useForm()
    const [oSavedata, setSavedata] = useState([])
    const [templateUsers, settemplateUsers] = useState<any>([]);
    const [ellipsis, setEllipsis] = useState(false);
    const [yScroll, setYScroll] = useState(false);
    const [xScroll, setXScroll] = useState<string | undefined>(undefined);
    
    let BASE_USERS_API_URL: any = process.env.REACT_APP_USERS_API;

    const items: MenuProps['items'] = [
        {
            key: '1',
            label: (
                <a target="_blank" rel="noopener noreferrer" href="https://www.antgroup.com">
                    1st menu item
                </a>
            ),
        },
        {
            key: '2',
            label: (
                <a target="_blank" rel="noopener noreferrer" href="https://www.aliyun.com">
                    2nd menu item
                </a>
            ),
        },
        {
            key: '3',
            label: (
                <a target="_blank" rel="noopener noreferrer" href="https://www.luohanacademy.com">
                    3rd menu item
                </a>
            ),
        },
    ];
    const onUserSelect = (oData: any) => {
        setDisplayForm(oData)
        setUserSelect(false)
        setUserSlectedId(oData._id)
        oUserEditForm.setFieldsValue(oData)
    }
    const oGetUsers = () => {
        axios.post(`${BASE_USERS_API_URL}/users`, {
            "filter": {},
            "search": ""
        }, authHeaders())
            .then((oResponse) => {
                const oData = oResponse.data.data;

                let oCatelog: any = {}
                // oData.map((ofield:any,index:any)=>{
                //     coursesdata.push({
                //         title:ofield.name,
                //         description:ofield.address,
                //         Avatar:ofield.role
                //     })
                // })
                Object.keys(oData[0]).map((ofield) => {
                    oCatelog[ofield] = ''
                })
                setUsers(oData)
                setSavedata(oCatelog)
                console.log(oData)
                // console.log(oResponse)
            })
            .catch((oError) => {
                console.log("oError")
            })
    }
    const onUserAdd = (oFormdata: any) => {
        // const oSave = { ...oSavedata, ...oFormdata };
        delete oFormdata.confirm
        const oSave = { ...oFormdata, ...{ saltStored: '' } };
        // delete oSave._id
        console.log(oSave);
        const oPermissions: any = sessionStorage.getItem('Permissions')
        // if (oPermissions?.write) {
        axios.post(`${BASE_USERS_API_URL}/users`, oSave, authHeaders())
            .then((oResponse) => {
                message.loading('Saving', 2.5).then(() => {
                    message.success("User Saved Successfully")
                    oGetUsers()
                })
            })
            .catch((oError) => {
                message.error("User Saved Failed")
            })
        // } else {
        //     message.loading('Verifying', 2.5).then(() => message.error("Permission Denied"))
        // }
        setModal1Open(false)

    }
    const onUserDelete = (oFormdata: any) => {
        setDeleteLoading(true)
        const oDelete: any = oUserEditForm.getFieldsValue;
        console.log(oDelete);
        const oPermissions: any = sessionStorage.getItem('Permissions')
        // if (oPermissions?.write) {
        axios.delete(`${BASE_USERS_API_URL}/user/${sUserSelectedid}`, authHeaders())
            .then((oResponse) => {
                message.loading('Deleting', 2.5).then(() => {
                    message.success("User Deletion Successfully")
                    onCloseLoadings()
                    setUserSelect(true)
                    oGetUsers()
                })
            })
            .catch((oError) => {
                message.error("User Deletion Failed")
                onCloseLoadings()
            })
        // } else {
        //     message.loading('Verifying', 2.5).then(() => message.error("Permission Denied"))
        // }

    }
    const onUserUpdate = (oEventdata: any) => {
        const oSave: any = oUserEditForm.getFieldsValue();
        console.log(oSave);

        axios.put(`${BASE_USERS_API_URL}/user/${sUserSelectedid}`, oSave, authHeaders())
            .then((oResponse) => {
                message.success("User Updated Successfully")
                onEdit(oDisplayFormMode)
            })
            .catch((oError) => {
                message.error("User Updated Failed")
            })
    }
    const onEdit = (sMode: any) => {
        if (sMode === "Display") {
            setDisplayFormMode("Edit")
        } else {

            setDisplayFormMode("Display")
        }
    }
    const onCloseLoadings = () => {
        setDeleteLoading(false)
    }
    useEffect(() => {
        axios.post(`${BASE_USERS_API_URL}/users`, {
            "filter": {},
            "search": ""
        }, authHeaders())
            .then((oResponse) => {
                const oData = oResponse.data.data;

                let oCatelog: any = {}
                // oData.map((ofield:any,index:any)=>{
                //     coursesdata.push({
                //         title:ofield.name,
                //         description:ofield.address,
                //         Avatar:ofield.role
                //     })
                // })
                Object.keys(oData[0]).map((ofield) => {
                    oCatelog[ofield] = ''
                })
                setUsers(oData)
                setSavedata(oCatelog)
                console.log(oData)
                // console.log(oResponse)
            })
            .catch((oError) => {
                console.log("oError")
            })
    }, [])
    const oRoleInfo = (
        <Form.Item name="prefix" noStyle>
            <Select style={{ width: 70 }}>
                <Option value="professor">Professor</Option>
                <Option value="admin">Admin</Option>
            </Select>
        </Form.Item>
    )
    const prefixSelector = (
        <Form.Item noStyle>
            <Select style={{ width: 70 }}>
                <Option value="+91">+91</Option>
            </Select>
        </Form.Item>
    );
    const getBase64 = (file: RcFile): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    const getBase642 = (img: RcFile, callback: (url: string) => void) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => callback(reader.result as string));
        reader.readAsDataURL(img);
    };
    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as RcFile);
        }

        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
        setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
    };
    const handleChange: UploadProps['onChange'] = (info: UploadChangeParam<UploadFile>) => {
        if (info.file.status === 'uploading') {
            setLoading(true);
            return;
        }
        if (info.file.status === 'done') {
            // Get this url from response in real world.
            getBase642(info.file.originFileObj as RcFile, url => {
                setLoading(false);
                setImageUrl(url);
            });
        }
    };
    const uploadButton = (
        <div>
            {loading ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );
    const handleCancel = () => setPreviewOpen(false);
    const handleImport = (event: any) => {
        const files = event.target.files;
        if (files.length) {
            const file = files[0];
            const reader = new FileReader();
            reader.onload = event => {
                const wb = read(event?.target?.result);
                const sheets = wb.SheetNames;
                if (sheets.length) {
                    const rows = utils.sheet_to_json(wb.Sheets[sheets[0]]);
                    settemplateUsers(rows);
                }
            };
            reader.readAsArrayBuffer(file);
        }
    };
    const handleExport = () => {
        const headings = [["enrollID", "name", "email", "password", "phone", "dateOfBirth", "bloodGroup", "address", "role"]];
        const wb = utils.book_new();
        const ws = utils.json_to_sheet([]);
        utils.sheet_add_aoa(ws, headings);
        utils.sheet_add_json(ws, templateUsers, { origin: "A2", skipHeader: true });
        utils.book_append_sheet(wb, ws, "Report");
        writeFile(wb, "Report.xlsx");
    };
    const columns = [
        {
            title: 'EnrollID',
            dataIndex: 'enrollID',
        },
        {
            title: 'Name',
            dataIndex: 'name',
        },
        {
            title: 'Email',
            dataIndex: 'email',
        },
        {
            title: 'Password',
            dataIndex: 'password',
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
        },
        {
            title: 'DateOfBirth',
            dataIndex: 'dateOfBirth',
        },
        {
            title: 'BloodGroup',
            dataIndex: 'bloodGroup',
        },
        {
            title: 'Address',
            dataIndex: 'address',
        },
        {
            title: 'Role',
            dataIndex: 'role',
        },
        {
            title: 'Action',
            key: 'action',
            sorter: true,
            render: () => (
                <Space size="middle">
                    <a>Delete</a>
                    <a>
                        <Space>
                            More actions
                            <DownOutlined />
                        </Space>
                    </a>
                </Space>
            ),
        },
    ];
    const tableColumns = columns.map(item => ({ ...item, ellipsis }));
    const scroll: { x?: number | string; y?: number | string } = {};
    if (yScroll) {
        scroll.y = 240;
    }
    if (xScroll) {
        scroll.x = '100vw';
    }
    const onSearch = (oEvent:any) =>{
        const sVal = oEvent?.target?.value
       const aUSD = aUsers.filter((item:any)=>{ return sVal.toLowerCase() === '' ? item : item?.name?.toLowerCase()?.includes(sVal.toLowerCase())})
        setUsers(aUSD)
    }
    return (
        <Row className="Users">
            <Col className="Users-List" span={6} >
                <Row justify="space-between">
                    <Col className="Title">

                        <Title title="Users">Users</Title>
                    </Col>
                    <Col className="SelectType">
                        <Tooltip title="TemplateDownload">

                            <Button type="default" onClick={handleExport} icon={<DownloadOutlined />} />
                        </Tooltip>
                        <Tooltip title="UploadUsers">
                            <Button type="default" onClick={() => setModalMultiUsersOpen(true)} icon={<UploadOutlined />} />
                        </Tooltip>
                        <Dropdown menu={{ items }} ><Button icon={<UserAddOutlined />}>Select Type</Button></Dropdown>

                    </Col>
                </Row>
                <div className="Users-Tree">
                    <Input placeholder="Search" onChange={(oEvent)=>setSearchVal(oEvent?.target?.value)} prefix={<SearchOutlined />} suffix={
                        <>

                            <FilterOutlined />

                            {/* <UploadCSVFile/> */}
                            <Button type="primary" onClick={() => setModal1Open(true)}>Add</Button>
                        </>
                    } />
                    <List className="Users-MenuList" dataSource={aUsers.filter((item:any)=>{ return sSearchVal.toLowerCase() === '' ? item : item?.name?.toLowerCase()?.includes(sSearchVal.toLowerCase())})}
                        renderItem={(item: any) => (
                            <List.Item className="User-ListItem" actions={[<Text type="secondary">{item?.role}</Text>,<Button type="text" onClick={() => onUserSelect(item)} icon={<RightOutlined />} />]}>
                                <List.Item.Meta avatar={<Avatar style={{ backgroundColor: '#87d068' }}>{item?.role}</Avatar>}
                                    title={item?.name} description={item?.enrollID} />
                            </List.Item>
                        )}>

                    </List>
                </div>

            </Col>
            <Col span={16}>
                <div hidden={oUserSelect} className="UserDisplay">
                    <Row className="UserDisplay-Layout" justify="start">
                        <Row className="Display-Bar" justify="end">
                            <Tag icon={<CheckCircleOutlined />} color="success">
                                {oDisplayForm?.active === true ? "Active" : "InActive"}
                            </Tag>
                            <Button type="text" onClick={() => onEdit(oDisplayFormMode)} icon={oDisplayFormMode === "Display" ? <EditOutlined /> : <EyeOutlined />}></Button>
                            <Button type="text" onClick={() => onUserDelete(oDisplayForm)} disabled={bDeleteLoading} icon={<DeleteOutlined />}></Button>
                        </Row>
                        <Title className="Title">{oDisplayForm?.name}</Title>
                        <Row>
                            <Form className="Display-Form" form={oUserEditForm}  {...layout} layout="inline" >
                                <Row gutter={24}>
                                    <Col span={8}>

                                        <Form.Item name="enrollID" label="Id">
                                            <Input disabled={oDisplayFormMode === "Display" ? true : false} placeholder="EnterID" />
                                            {/* {oDisplayForm?.enrollID} */}
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>

                                        <Form.Item name="name" label="Name">
                                            <Input disabled={oDisplayFormMode === "Display" ? true : false} defaultValue={oDisplayForm?.name} placeholder="EnterName" />
                                        </Form.Item>

                                    </Col>
                                    <Col span={8}>

                                        <Form.Item name="address" label="Address">
                                            <Input disabled={oDisplayFormMode === "Display" ? true : false} defaultValue={oDisplayForm?.address} placeholder="EnterAddress" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>

                                        <Form.Item name="bloodgroup" label="Bloodgroup">
                                            <Input disabled={oDisplayFormMode === "Display" ? true : false} defaultValue={oDisplayForm?.bloodgroup} placeholder="EnterID" />
                                        </Form.Item>
                                    </Col>

                                    <Col span={8}>

                                        <Form.Item name="createdAt" label="CreatedAt">
                                            <Input disabled={oDisplayFormMode === "Display" ? true : false} defaultValue={oDisplayForm?.createdAt} placeholder="EnterName" />
                                        </Form.Item>
                                    </Col>

                                    <Col span={8}>

                                        <Form.Item name="dateOfBirth" label="DateOfBirth">
                                            <Input disabled={oDisplayFormMode === "Display" ? true : false} defaultValue={oDisplayForm?.dateOfBirth} placeholder="EnterAddress" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Divider />
                                <Row gutter={24}>
                                    <Col span={8}>

                                        <Form.Item name="phone" label="Contact">
                                            <Input disabled={oDisplayFormMode === "Display" ? true : false} defaultValue={oDisplayForm?.phone} placeholder="EnterID" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>

                                        <Form.Item name="role" label="Role">
                                            <Input disabled={oDisplayFormMode === "Display" ? true : false} defaultValue={oDisplayForm?.role} placeholder="EnterName" />
                                        </Form.Item>

                                    </Col>
                                    <Col span={8}>

                                        <Form.Item name="updatedAt" label="UpdatedAt">
                                            <Input disabled={oDisplayFormMode === "Display" ? true : false} defaultValue={oDisplayForm?.updatedAt} placeholder="EnterAddress" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>

                                        <Form.Item name="email" label="Email">
                                            <Input disabled={oDisplayFormMode === "Display" ? true : false} defaultValue={oDisplayForm?.email} placeholder="EnterAddress" />
                                        </Form.Item>
                                    </Col>
                                </Row>


                            </Form>
                        </Row>

                    </Row>
                    <Row className="Display-Bar" justify="end">
                        <Button type="primary" htmlType="submit" onClick={onUserUpdate} icon={<SaveOutlined />}>Save</Button>
                    </Row>
                </div>
            </Col>
            <Modal
                className="Modal-User"
                title="Create a New User"

                mask={true}
                centered
                open={modal1Open}
                onCancel={() => setModal1Open(false)}
                cancelText="Save as Draft"
                okText="Save & Proceed"
                footer={[
                    <>
                        <Button type="primary" onClick={() => {
                            oForm.validateFields()
                                .then((values: any) => {
                                    onUserAdd(values)
                                }).catch((info: any) => {
                                    console.log('ValidateFields', info)
                                })
                        }}>Save & Proceed</Button>
                    </>
                ]}
            >
                <Row className="User-add-ImgUpload">
                    <Upload
                        action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                        listType="picture-card"
                        onPreview={handlePreview}
                        onChange={handleChange}
                    >
                        {imageUrl ? <img src={imageUrl} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
                    </Upload>
                    <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancel}>
                        <img alt="example" style={{ width: '100%' }} src={previewImage} />
                    </Modal>
                </Row>
                <Form form={oForm} {...layout} layout="horizontal" >
                    <Form.Item rules={[{ required: true, message: 'Please input your EnrollID!' }]} name="enrollID" label="EnrollID">
                        <Input placeholder="EnrollID" />
                    </Form.Item>
                    <Form.Item rules={[{ required: true, message: 'Please input your UserName!' }]} name="name" label="UserName">
                        <Input placeholder="EnterName" />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="E-mail"
                        rules={[
                            {
                                type: 'email',
                                message: 'The input is not valid E-mail!',
                            },
                            {
                                required: true,
                                message: 'Please input your E-mail!',
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        label="Password"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your password!',
                            },
                        ]}
                        hasFeedback
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item name="confirm"
                        label="Confirm Password"
                        dependencies={['password']}
                        hasFeedback
                        rules={[
                            {
                                required: true,
                                message: 'Please confirm your password!',
                            },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('The two passwords that you entered do not match!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item
                        name="phone"
                        label="Phone Number"
                        rules={[{ required: true, message: 'Please input your phone number!' }]}
                    >
                        <Input addonBefore={prefixSelector} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item rules={[{ required: true, message: 'Please input your DateOfBirth!' }]} name="dateOfBirth" label="DateOfBirth">
                        <Input placeholder="DateOfBirth" />
                    </Form.Item>
                    <Form.Item rules={[{ required: true, message: 'Please input your BloodGroup!' }]} name="bloodGroup" label="BloodGroup">
                        <Input placeholder="BloodGroup" />
                    </Form.Item>
                    <Form.Item rules={[{ required: true, message: 'Please input your Address!' }]} name="address" label="Address">
                        <Input placeholder="EnterAddress" />
                    </Form.Item>
                    <Form.Item rules={[{ required: true, message: 'Please input your Department!' }]} name="department" label="Department">
                        <Input placeholder="EnterDepartment" />
                    </Form.Item>
                    <Form.Item  rules={[{ required: true, message: 'Please input your Batch!' }]} name="batch" label="Batch">
                        <Input type="number" placeholder="EnterBatch" />
                    </Form.Item>
                    <Form.Item rules={[{ required: true, message: 'Please input your Role!' }]} name="role" label="Role">
                        <Select>
                            <Option value="professor">Professor</Option>
                            <Option value="admin">Admin</Option>
                        </Select>
                    </Form.Item>

                </Form>
            </Modal>
            <Modal
                className="Modal-Bluk-User"
                title="Create a New Users"

                mask={true}
                centered
                open={modalMultiUsersOpen}
                onCancel={() => setModalMultiUsersOpen(false)}
                cancelText="Save as Draft"
                okText="Save & Proceed"
                footer={[
                    <>
                        <Button type="primary" onClick={() => {
                            oForm.validateFields()
                                .then((values: any) => {
                                    onUserAdd(values)
                                }).catch((info: any) => {
                                    console.log('ValidateFields', info)
                                })
                        }}>Save & Proceed</Button>
                    </>
                ]}>
                <Input type="file" name="file"
                    className="custom-file-input"
                    id="inputGroupFile"
                    required
                    onChange={(handleImport)}
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheet"
                />
                <Table
                    columns={tableColumns}
                    scroll={scroll}
                />
            </Modal>
        </Row>
    )
}
export default Users