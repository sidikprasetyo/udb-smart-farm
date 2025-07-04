"use client";

import FormInput from "../../elements/Input";

interface LoginFragmentProps {
  loginData: {
    email: string;
    password: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const LoginFragment: React.FC<LoginFragmentProps> = ({ loginData, onChange }) => {
  return (
    <>
      <FormInput name={"email"} placeholder={"Email Address"} inputType={"email"} isRequired={true} value={loginData.email} onChange={onChange}>
        Email Address
      </FormInput>

      <FormInput name={"password"} placeholder={"Password"} inputType={"password"} isRequired={true} value={loginData.password} onChange={onChange}>
        Password
      </FormInput>
    </>
  );
};

export default LoginFragment;
