document.addEventListener("DOMContentLoaded", function () {
  // Use buttons to toggle between views
  document
    .querySelector("#inbox")
    .addEventListener("click", () => load_mailbox("inbox"));
  document
    .querySelector("#sent")
    .addEventListener("click", () => load_mailbox("sent"));
  document
    .querySelector("#archived")
    .addEventListener("click", () => load_mailbox("archive"));
  document.querySelector("#compose").addEventListener("click", compose_email);
  document.querySelector("form").onsubmit = send_email;

  // By default, load the inbox
  load_mailbox("inbox");
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";

  // Show the mailbox name
  document.querySelector("#emails-view").innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;

  // Show the respective mailbox contents
  fetch(`emails/${mailbox}`)
    .then((response) => response.json())
    .then((emails) => {
      console.log(emails);
      emails.forEach((email) => display_mail(email, mailbox));
    })
    .catch((error) => {
      console.log(error);
    });
}

function send_email() {
  /*
   * This Function grabs inputs from user and sends them to database then send to mail recipients
   */
  const recipients = document.querySelector("#compose-recipients").value;
  const subject = document.querySelector("#compose-subject").value;
  const body = document.querySelector("#compose-body").value;

  console.log(recipients);
  console.log(subject);
  console.log(body);

  fetch("emails", {
    method: "POST",
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body,
    }),
  })
    .then((response) => response.json())
    .then((result) => {
      // Handle Messages
      if ("error" in result) {
        alert(`${result["error"]}`);
      }

      if ("message" in result) {
        alert(`${result["message"]}`);
      }

      // Logs in send_emails
      alert(result);
    })
    .catch((error) => {
      console.log(error);
    });

  load_mailbox("sent");

  return false;
}

/*
 * Display respective mailbox contents
 */

function display_mail(email, mailbox) {
  // Create div for each card
  const create_card = document.createElement("div");
  create_card.id = "email";

  // Color code emails
  if (mailbox === "inbox") {
    if (email.read != true) {
      create_card.className = "row card-body text-white bg-success mb-3"; // Green for new emails
    } else {
      create_card.className = "row card-body text-white bg-secondary mb-3"; // Grey for read emails
    }
  } else if (mailbox === "sent") {
    create_card.className = "row card-body text-white bg-warning mb-3"; // Yellow for sent emails
  } else if (mailbox === "archive") {
    create_card.className = "row card-body text-dark bg-info mb-3"; // Teal for archived emails
  }

  // Create and display senders/recipients div
  const create_recipients = document.createElement("div");
  create_recipients.id = "recipient-email";
  create_recipients.className = "col-lg-3 col-md-5 col-sm-2";

  if (mailbox === "inbox") {
    create_recipients.innerHTML = `From: ${email.sender}`;
  } else {
    create_recipients.innerHTML = `To: ${email.recipients}`;
  }

  create_card.append(create_recipients);

  // create and display subjects
  const create_subject = document.createElement("div");
  create_subject.id = "subject-email";
  create_subject.className = "col-lg-2 col-md-3 col-md-12";
  create_subject.innerHTML = `Subject: ${email.subject}`;

  create_card.append(create_subject);

  // create and display email contents
  const content = document.createElement("div");
  content.id = "content-email";
  content.className = "col-lg-2 col-md-3 col-md-12";
  content.innerHTML = `Content: ${email.body}`;

  create_card.append(content);
  // create and display timestamp
  const email_timestamp = document.createElement("div");
  email_timestamp.id = "timestamp-email";
  email_timestamp.className = "col-lg-2 col-md-3 col-md-12";
  email_timestamp.innerHTML = `${email.timestamp}`;

  create_card.append(email_timestamp);

  // Create archive icon
  const archive_div = document.createElement("div");
  archive_div.id = "Archive-icon-div";
  archive_div.className = "col-lg-2 col-md-3 col-md-12";
  archive_div.innerHTML = "Archive this email";
  const archive_icon = document.createElement("img");
  archive_icon.id = "archive-icon";
  archive_icon.src = "static/mail/archive.svg";
  archive_icon.className = "bi bi-archive";
  archive_icon.style = "align-items: center; ";
  archive_icon.addEventListener("click", () => {
    console.log(`Just clicked on archive icon ${email.archived}`);
    const reverse_status = !email.archived;
    console.log(`Just clicked on archive icon 2 ${reverse_status}`);

    // Change archive status of the email when icon is clicked
    fetch(`emails/${email.id}`, {
      method: "PUT",
      body: JSON.stringify({
        archived: reverse_status,
      }),
    });
    load_mailbox("inbox");
    window.location.reload();
  });

  archive_div.append(archive_icon);
  create_card.append(archive_div);
  // create_card.append(archive_icon);
  // Add everything to email view

  // Create control element
  const control = document.createElement("div");
  control.id = "control";
  control.className = "row card";

  control.appendChild(create_card);

  // Adding cards into view
  document.querySelector("#emails-view").appendChild(control);

  console.log(`This email read status ${email.read}`);
  control.addEventListener("click", () => {
    console.log("Just clicked on an email");
    console.log(`read status is ${email.read}`);

    const reverse_read = !email.read;

    // Change email read status
    fetch(`emails/${email.id}`, {
      method: "PUT",
      body: JSON.stringify({
        read: reverse_read,
      }),
    });
    display_email(email);
  });
}

function display_email(email) {
  /*
   * This function is used to display individual email
   */

  compose_email();

  document.querySelector("#compose-recipients").value = email.recipients;
  document.querySelector("#compose-subject").value = email.subject;
  document.querySelector("#compose-body").value = email.body;
  document
    .querySelector("#send-email")
    .addEventListener("click", () => reply_email(email));
}

function reply_email(email) {
  /*
   * This function show reply email form and send the reply email
   */

  console.log(`this REPLY email is: ${email.id}`);

  compose_email();

  document.querySelector(
    "#compose-view > h3"
  ).innerHTML = `<h3>Reply emails to ${email.sender}: </h3>`;
  document.querySelector("#compose-recipients").value = email.sender;
  document.querySelector("#compose-subject").value =
    email.subject.slice(0, 4) === "RE: "
      ? email.subject
      : "RE: " + email.subject;
  const pre_body = `---- At ${email.timestamp} ${email.sender} sent: ---- \n`;
  document.querySelector("#compose-body").value = pre_body + email.body;
}
