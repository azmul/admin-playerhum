import React, { useState, useCallback, useEffect } from "react";
import {
  Card,
  message,
  Spin,
  Form,
  Input,
  Button,
  Drawer,
  Table,
  Space,
  Select,
  Descriptions,
  Divider,
  DatePicker,
  Row,
  Col,
  Radio,
} from "antd";
import * as footballApi from "./footballApi";
import useTranslation from "next-translate/useTranslation";
import { useSelector } from "react-redux";
import { RootState } from "app/../redux/store";
import moment from "moment";
import { capitalize } from "lodash";
import styles from "./Styles.module.scss";
import { UserOutlined } from "@ant-design/icons";
import { DateFormats } from "app/date/dateConst";
import { NATIONALITY } from "app/constant/register";
import Image from "next/image";

const { RangePicker } = DatePicker;

export default function Link() {
  const [visible, setVisible] = useState(false);
  const [create, setCreate] = useState(false);
  const [loading, setloading] = useState(false);
  const [form] = Form.useForm();
  const [formSearch] = Form.useForm();
  const { t } = useTranslation("ns1");
  const [items, setItems] = useState([]);
  const [item, setItem] = useState<any>(undefined);
  const [params, setParams] = useState<any>(undefined);
  const [pagination, setpagination] = useState(undefined);
  const [slectedDate, setSelectedDate] = useState<any>(undefined);

  const profile: any = useSelector(
    (state: RootState) => state.authModel.profile
  );

  const columns: any = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "District",
      dataIndex: "district",
      key: "district",
    },
    {
      title: "Birth Day",
      dataIndex: "birthDay",
      key: "birthDay",
      render: (_name: string, record: any) =>
        moment(record?.birthDay).format("MMMM Do YYYY"),
    },
    {
      title: "Created Time",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (_name: string, record: any) =>
        moment(record?.createdAt).format("MMMM Do YYYY, h:mm:ss a"),
    },
    {
      title: "Verified",
      dataIndex: "verified",
      key: "verified",
      // eslint-disable-next-line react/display-name
      render: (_name: string, record: any) => (record?.verified ? "Yes" : "No"),
    },
    {
      title: "Status",
      dataIndex: "playerStatus",
      key: "playerStatus",
      // eslint-disable-next-line react/display-name
      render: (_name: string, record: any) => (record?.playerStatus ? "Yes" : "No"),
    },
    {
      title: "Action",
      key: "action",
      // eslint-disable-next-line react/display-name
      render: (record: any) => (
        <Space size="middle">
          <Button onClick={() => handleEdit(record?._id)} type="primary">
            {" "}
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  const onDateChange = (dates: any) => {
    setSelectedDate(dates);
  };

  const onFinish = async (values: any) => {
    try {
      setloading(true);
      values.lastUpdatedBy = profile?.name;

      await footballApi.updateItem(item?._id, values);

      message.success({
        content: `${create ? "Created" : "Updated"} Sucessfully`,
        style: {
          marginTop: "10vh",
        },
        duration: 5,
      });

      form.resetFields();
      setVisible(false);
      getItems(params);
    } catch (error: any) {
      message.error(error?.message);
      message.error("Product Not Found");
    } finally {
      setloading(false);
    }
  };

  const handleEdit = async (id: any) => {
    setCreate(false);
    setVisible(true);
    try {
      setloading(true);
      const item: any = await footballApi.getItem(id);
      form.setFieldsValue({
        verified: item.verified,
        playerStatus: item.playerStatus,
        comment: item.comment,
      });

      setItem(item);
    } catch (error: any) {
      setVisible(false);
      message.error(error?.message);
      message.error("Product Not Found");
    } finally {
      setloading(false);
    }
  };

  const onSearch = (values: any) => {
    if (values?.id) {
      handleEdit(values?.id);
    }
  };

  const closeDrawer = () => {
    setVisible(false);
  };

  const getItems = useCallback(
    async (params?: any) => {
      setParams(params);
      const query: any = { ...params };

      if (slectedDate) {
        query.startDate = moment(slectedDate[0]).format(DateFormats.API_DATE);
        query.endDate = moment(slectedDate[1])
          .add(1, "days")
          .format(DateFormats.API_DATE);
      }

      if (query && query?.total) {
        delete query.total;
      }

      try {
        setloading(true);
        const response: any = await footballApi.getItems({ ...query });
        setItems(response?.data);
        setpagination(response?.pagination);
      } catch (error: any) {
        message.error(error?.message);
      } finally {
        setloading(false);
      }
    },
    [slectedDate]
  );

  useEffect(() => {
    getItems();
  }, [getItems]);

  return (
    <Card title="Club List">
      <Drawer
        title={`Update Club #${item?.id}`}
        placement="right"
        onClose={closeDrawer}
        visible={visible}
        width={550}
      >
        <Spin spinning={loading}>
          {item && item?.image?.url && (
            <Image
              width={400}
              height={450}
              alt="Profile"
              src={item?.image?.url}
            />
          )}
          <Descriptions column={2} title="Player Info">
            <Descriptions.Item label="Name">
              {item && item.name}
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              {item && item.phone}
            </Descriptions.Item>
            <Descriptions.Item label="Verified">
              {item && item.verified ? "Yes" : "No"}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {item && item.status ? "Yes" : "No"}
            </Descriptions.Item>
            <Descriptions.Item label="District">
              {item && item.district}
            </Descriptions.Item>
            <Descriptions.Item label="Upazila">
              {item && item.upazila}
            </Descriptions.Item>
            <Descriptions.Item label="Address">
              {item && item.address}
            </Descriptions.Item>
            <Descriptions.Item label="Nationality">
              <Select value={Number(item?.nationality)} allowClear>
                {NATIONALITY.map((nationality) => (
                  <Select.Option
                    key={nationality?.name}
                    value={nationality?.value}
                  >
                    {nationality?.name}
                  </Select.Option>
                ))}
              </Select>
            </Descriptions.Item>
            <Descriptions.Item label="Created At">
              {moment(item?.createdAt).format("MMMM Do YYYY, h:mm:ss a")}
            </Descriptions.Item>
            <Descriptions.Item label="Updated At">
              {moment(item?.updatedAt).format("MMMM Do YYYY, h:mm:ss a")}
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          <Form layout="vertical" form={form} onFinish={onFinish}>
            <Row justify="space-around">
              <Col md={6}>
                <Form.Item
                  label="Verified"
                  name="verified"
                  rules={[{ required: true, message: "Please give Verified" }]}
                >
                  <Radio.Group>
                    <Radio.Button value={true}>Yes</Radio.Button>
                    <Radio.Button value={false}>No</Radio.Button>
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col md={6}>
                <Form.Item
                  label="Player Status"
                  name="playerStatus"
                  rules={[{ required: true, message: "Please give Status" }]}
                >
                  <Radio.Group>
                    <Radio.Button value={true}>Yes</Radio.Button>
                    <Radio.Button value={false}>No</Radio.Button>
                  </Radio.Group>
                </Form.Item>
              </Col>
            </Row>

            {!create && (
              <Form.Item label="Last Updated By">
                <div>
                  Name:{" "}
                  {item && item?.lastUpdatedBy ? item?.lastUpdatedBy : "N/A"}
                </div>
                <div>
                  Time: {item && capitalize(moment(item?.updatedAt).fromNow())}
                </div>
              </Form.Item>
            )}

            <Form.Item label="Comment" name="comment">
              <Input.TextArea placeholder="Leave a Comment" />
            </Form.Item>

            <Form.Item>
              <Space size="middle">
                <Button type="primary" htmlType="submit">
                  {create ? "Create" : "Update"}
                </Button>
                <Button onClick={closeDrawer}>Close</Button>
              </Space>
            </Form.Item>
          </Form>
        </Spin>
      </Drawer>
      <Row justify="space-between">
        <Col>
          <Form
            className={styles.searchForm}
            form={formSearch}
            name="horizontal_login"
            layout="inline"
            onFinish={onSearch}
          >
            <Form.Item
              name="id"
              rules={[{ required: true, message: "Give Product Numeric ID" }]}
            >
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder={"Id"}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                {t("table:find")}
              </Button>
            </Form.Item>
          </Form>
        </Col>
        <Col>
          <RangePicker
            ranges={{
              Today: [moment(), moment()],
              "This Month": [
                moment().startOf("month"),
                moment().endOf("month"),
              ],
            }}
            onChange={onDateChange}
          />
          <Button
            onClick={getItems}
            loading={loading}
            style={{ marginLeft: 10 }}
            type="primary"
          >
            Refresh
          </Button>
        </Col>
      </Row>
      <Spin spinning={loading}>
        <Table
          onChange={getItems}
          pagination={pagination && pagination}
          loading={loading}
          columns={columns}
          dataSource={items}
        />
      </Spin>
    </Card>
  );
}
