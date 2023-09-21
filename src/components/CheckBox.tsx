import { url } from "inspector";
import React, { FC, Fragment, useState } from "react";

const CheckBox = () => {
  const [checked, setChecked] = useState<boolean>(false);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setChecked(event.target.checked);
  };
  return (
    <Fragment>
      <label>
        <input type="checkbox" checked={checked} onChange={handleChange} />
      </label>

      {checked && (
        <div
          style={{
            backgroundImage: `url(https://img.freepik.com/free-photo/field-full-daisies_1127-272.jpg?w=1380&t=st=1665407533~exp=1665408133~hmac=c5328e2a09553fff4989cb084348c69d7ce31f6e6f7f49de1365692756879200)`,
            width: 800,
            height: 800,
          }}
        ></div>
      )}
    </Fragment>
  );
};

export default CheckBox;
