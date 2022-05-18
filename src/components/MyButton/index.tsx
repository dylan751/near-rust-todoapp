import React, { useState } from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const MyButton = (props: {
  loading: boolean;
  disable: boolean;
  text: string;
  onClick?: Function;
}) => {
  const [buttonText, setButtonText] = useState(props.text);
  const disable = props.loading || props.disable;

  const style = disable
    ? "rounded w-full h-11 text-center text-base text-white focus:outline-none font-semibold opacity-40  bg-gradient-to-b from-gradientFrom to-gradientTo hover:from-gradientFromHover to:from-gradientToHover cursor-not-allowed"
    : "rounded w-full h-11 text-center text-base text-white focus:outline-none font-semibold button-active hover:from-gradientFromHover to:from-gradientToHover cursor-pointer";
  return (
    <div className={style} onClick={(event) => props.onClick()}>
      <button
        className={
          disable
            ? "w-full h-full cursor-not-allowed"
            : "w-full h-full cursor-pointer"
        }
      >
        {buttonText}
        {props.loading && (
          <Spin
            className={"ml-2"}
            indicator={
              <LoadingOutlined
                className={"text-white"}
                style={{ fontSize: 24 }}
                spin
              />
            }
          />
        )}
      </button>
    </div>
  );
};

const MaxButton = (props: any) => {
  return (
    <span
      onClick={() => {
        props.onClick(props.value);
      }}
      className={"text-xs cursor-pointer"}
    >
      MAX
    </span>
  );
};

export { MyButton, MaxButton };
