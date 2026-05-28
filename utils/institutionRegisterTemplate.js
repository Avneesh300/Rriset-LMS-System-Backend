const institutionRegisterTemplate = (
  data
) => {

  return `

  <div style="
    max-width:600px;
    margin:auto;
    font-family:Arial;
    background:#f5f5f5;
    padding:40px;
  ">

    <div style="
      text-align:center;
      margin-bottom:30px;
    ">

      <img
        src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
        alt="Institution Logo"
        width="80"
      />
    </div>

    <p style="
      font-size:18px;
    ">
      Dear ${data.contact_person_name},
    </p>

    <p style="
      font-size:16px;
      line-height:26px;
    ">
      Your institution has been
      successfully registered
      on our platform.
    </p>

    <div style="
      background:#eaf3ec;
      border-left:5px solid green;
      padding:20px;
      margin-top:20px;
      margin-bottom:20px;
    ">

      <p>
        <strong>
          Institution Name:
        </strong>

        ${data.institution_name}
      </p>

      <p>
        <strong>Email:</strong>

        ${data.email}
      </p>

      <p>
        <strong>Mobile:</strong>

        ${data.mobile}
      </p>

    </div>

    <p style="
      margin-bottom:30px;
    ">
      You can now login to your
      dashboard using the button below:
    </p>

    <a
      href="https://yourfrontend.com/login"

      style="
        background:green;
        color:white;
        padding:15px 30px;
        text-decoration:none;
        border-radius:5px;
        display:inline-block;
      "
    >
      Login to Dashboard
    </a>

    <p style="
      margin-top:40px;
      line-height:28px;
    ">
      You can now log in to your
      account and start managing
      your institution activities.
    </p>

    <p>
      If you have any questions
      or need assistance,
      feel free to contact our
      support team.
    </p>

    <br />

    <p>
      Regards,
      <br />
      <strong>Team</strong>
    </p>

  </div>
  `;
};

module.exports =
  institutionRegisterTemplate;