import { useState, useEffect } from "react";

// antd date picker
import { DatePicker as AndtdDatePicker } from "antd";
import dayjs from "dayjs";
const { RangePicker } = AndtdDatePicker;

const DateRangeWidget: React.FC<any> = (props: any) => {
  const { time = false } = props;
  const [dataSource, setDataSource] = useState<any>("");
  //   const [datepicker, setDatePicker] = useState("");

  let stDate: any = props?.value
    ? dayjs(props?.value.startDate)
    : dayjs(new Date());
  let enDate: any = props?.value
    ? dayjs(props?.value.endDate)
    : dayjs(new Date());

  useEffect(() => {
    if (props.value == undefined) {
      setDataSource("");
    } else if (props?.value) {
      setDataSource(props.value);
    }
  }, [props.value]);

  return (
    <div className="rangePickerContainer">
      <RangePicker
        style={{ width: "100%" }}
        defaultValue={[stDate, enDate]}
        onChange={(e: any) => {
          let data: any = {};
          data.startDate = new Date(e[0].toDate()).toISOString();
          data.endDate = new Date(e[1].toDate()).toISOString();
          setDataSource(data);
          props.onChange(data);
        }}
      />
    </div>
  );
};

export default DateRangeWidget;
