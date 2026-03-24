import { useState, type SetStateAction } from "react";
import Swal from "sweetalert2";
import { registerUser } from "../services/authService";
import type { RegisterPayload } from "../services/authService";
import { useNavigate } from "react-router-dom";

const Register = () => {
    const [step, setStep] = useState(1);
    const navigate = useNavigate();

    const [form, setForm] = useState<RegisterPayload>({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        contactNumber: "",
        address: "",
        role: "participant",
        motivation: "",
        reason: "",
        preferredSessionDuration: 60,
        bio: "",
    });

    const handleNext = () => {
        if (
            !form.firstName.trim() ||
            !form.lastName.trim() ||
            !form.email.trim() ||
            !form.contactNumber.trim() ||
            !form.role
        ) {
            return Swal.fire(
                "Missing Fields",
                "Please fill First Name, Last Name, Email, Contact Number and Role",
                "warning"
            );
        }

        setStep(2);
    };

    const [confirmPassword, setConfirmPassword] = useState("");

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        setForm({
            ...form,
            [e.target.name]:
                e.target.name === "preferredSessionDuration"
                    ? Number(e.target.value)
                    : e.target.value,
        });
    };

    const handleSubmit = async () => {
        if (form.password !== confirmPassword) {
            return Swal.fire("Error", "Passwords do not match", "error");
        }

        try {
            Swal.fire({
                title: "Registering...",
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
            });

            const res = await registerUser(form);

            Swal.close();

            Swal.fire({
                icon: "success",
                title: "Registered Successfully",
                text: res?.message || "User created",
            }).then(() => {
                navigate("/login"); // 🚀 redirect here
            });

        } catch (err: any) {
            Swal.close();

            Swal.fire({
                icon: "error",
                title: "Error",
                text: err?.response?.data?.message || "Registration failed",
            });
        }
    };

    return (
        <div
            style={{
                position: "fixed",   // 👈 required
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 4,

                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "linear-gradient(135deg, #1e3a8a, #6d28d9)",
                fontFamily: "Arial",
            }}
        >
            <div
                style={{
                    width: "400px",
                    padding: "30px",
                    borderRadius: "12px",
                    background: "white",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                }}
            >
                <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
                    {step === 1 ? "Create Account" : "Set Password"}
                </h2>

                {step === 1 && (
                    <>
                        <Input name="firstName" placeholder="First Name" onChange={handleChange} />
                        <Input name="lastName" placeholder="Last Name" onChange={handleChange} />
                        <Input name="email" placeholder="Email" onChange={handleChange} />
                        <Input name="contactNumber" placeholder="Contact Number" onChange={handleChange} />
                        <Input name="address" placeholder="Address" onChange={handleChange} />

                        <select
                            name="role"
                            onChange={handleChange}
                            style={inputStyle}
                            defaultValue=""
                        >
                            <option value="" disabled>
                                Choose your role
                            </option>
                            <option value="participant">Participant</option>
                            <option value="coach">Coach</option>
                        </select>

                        <Input name="motivation" placeholder="Motivation" onChange={handleChange} />
                        <Input name="reason" placeholder="Reason" onChange={handleChange} />

                        <Input
                            name="preferredSessionDuration"
                            type="number"
                            placeholder="Preferred Session Duration In Minutes"
                            onChange={handleChange}
                        />

                        <textarea
                            name="bio"
                            placeholder="Bio"
                            onChange={handleChange}
                            style={{ ...inputStyle, height: "70px" }}
                        />

                        <button style={buttonStyle} onClick={handleNext}>
                            Next →
                        </button>
                    </>
                )}

                {step === 2 && (
                    <>
                        <Input
                            name="password"
                            type="password"
                            placeholder="Password"
                            onChange={handleChange}
                        />

                        <Input
                            name="confirmPassword"
                            type="password"
                            placeholder="Confirm Password"
                            onChange={(e: { target: { value: SetStateAction<string>; }; }) => setConfirmPassword(e.target.value)}
                        />

                        <button style={buttonStyle} onClick={handleSubmit}>
                            Register
                        </button>

                        <button
                            style={{
                                marginTop: "10px",
                                background: "transparent",
                                border: "none",
                                color: "#6d28d9",
                                cursor: "pointer",
                            }}
                            onClick={() => setStep(1)}
                        >
                            ← Back
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

const Input = ({ ...props }: any) => (
    <input {...props} style={inputStyle} />
);

const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    marginBottom: "14px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    outline: "none",
    boxSizing: "border-box",
    fontSize: "14px",
};

const buttonStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px",
    background: "linear-gradient(135deg, #22c55e, #16a34a)",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "0.3s",
};

export default Register;