"use client";

import { useState } from "react";
import FormInput from "../../elements/Input";

const LoginFragment = () => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  interface FormInputEvent {
    target: {
      name: string;
      value: string;
    };
  }

  const handleChange = (e: FormInputEvent) => {
    const { name, value } = e.target;
    setLoginData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <>
      <FormInput name={"email"} placeholder={"Email Address"} inputType={"email"} isRequired={true} value={loginData.email} onChange={handleChange}>
        Email Address
      </FormInput>

      <FormInput name={"password"} placeholder={"Password"} inputType={"password"} isRequired={true} value={loginData.password} onChange={handleChange}>
        Password
      </FormInput>
    </>
  );
};

export default LoginFragment;
