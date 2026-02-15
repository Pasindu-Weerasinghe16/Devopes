import { FaLock } from "react-icons/fa";
import { Link , useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import AuthContext from "../AuthContext";

const API_BASE =
  process.env.REACT_APP_API_URL || `http://${window.location.hostname}:4000`;

function Register() {

    const [form , setFrom] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phoneNumber: "",
        imageUrl: "",
    });

    const navigate = useNavigate();
    const { isAuthenticated, login } = useContext(AuthContext);

    useEffect(() => {
      if (isAuthenticated) {
        navigate('/inventory', { replace: true });
      }
    }, [isAuthenticated, navigate]);
    
    const handleInputChange = (e) => {
        setFrom({ ...form, [e.target.name]: e.target.value });

    };


  const registerUser = () => {
  fetch(`${API_BASE}/api/register`, {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(form),
  })
    .then(async (res) => {
      if (!res.ok) {
        const txt = await res.text();
        alert(txt || 'Registration failed');
        return;
      }
      const data = await res.json();
      const token = data?.token;
      const userId = data?._id;
      if (!token || !userId) {
        alert('Registration succeeded but token missing');
        return;
      }
      login(token, userId);
      navigate('/inventory');
    })
    .catch((err) => console.log(err));
  };

    const uploadImage = async (image) => {
        const data = new FormData();
        data.append("file" , image);
        data.append("upload_preset" , "inventoryapp");

        await fetch(`${API_BASE}/api/upload-image`,{
            method : "POST",
            body : data,
        })
        .then(res => res.json())
        .then((data) => {
            setFrom({ ...form , imageUrl: data.url })
            alert("Image Successfully Uploaded");
        })
        .catch((error) => console.log(error));
    };


    const handleSubmit = (e) => {
        e.preventDefault();
    }





  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 h-screen items-center place-items-center">
        <div className="flex justify-center order-first sm:order-last">
          <img src={require("../assets/register.jpg")} alt="" />
        </div>
        <div className="w-full max-w-xl space-y-8 p-14 rounded-lg">
          <div className="flex flex-col items-center justify-center">
            <img
              className="h-40 w-auto mb-2"
              src={require("../assets/logo.png")}
              alt="Your Company"
            />
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 font-mono text-center">
              Sign Up
            </h2>
          </div>
          <form className="mt-8 space-y-6"  onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-6">
              <div className="flex gap-4">
                <input
                  name="firstName"
                  type="text"
                  required
                  className="relative block w-full rounded-md border-0 py-3 px-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-base sm:leading-6"
                  placeholder="First Name"
                  value={form.firstName}
                  onChange={handleInputChange}
                />
                <input
                  name="lastName"
                  type="text"
                  required
                  className="relative block w-full rounded-md border-0 py-3 px-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-base sm:leading-6"
                  placeholder="Last Name"
                  value={form.lastName}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="relative block w-full rounded-md border-0 py-3 px-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-base sm:leading-6"
                  placeholder="Email address"
                  value={form.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="relative block w-full rounded-md border-0 py-3 px-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-base sm:leading-6"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleInputChange}
                />
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaLock className="text-gray-400" />
                </span>
              </div>
              <div>
                <input
                  name="phoneNumber"
                  type="number"
                  autoComplete="phoneNumber"
                  required
                  className="relative block w-full rounded-md border-0 py-3 px-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-base sm:leading-6"
                  placeholder="Phone Number"
                  value={form.phoneNumber}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  required
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900"
                >
                  I Agree Terms & Conditions
                </label>
              </div>

              <div className="text-sm">
                <span className="font-medium text-indigo-600 hover:text-indigo-500">
                  Forgot your password?
                </span>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative flex w-full justify-center rounded-md bg-gradient-to-r from-blue-600 to-cyan-400 py-2 px-3 text-lg font-semibold text-white shadow-lg hover:from-blue-500 hover:to-cyan-300 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                onClick={registerUser}
              >
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <FaLock className="h-5 w-5 text-cyan-200 group-hover:text-cyan-100" aria-hidden="true" />
                </span>
                <span className="ml-6">Sign up</span>
              </button>
              <p className="mt-2 text-center text-sm text-gray-600">
                Or{" "}
                <span className="font-medium text-indigo-600 hover:text-indigo-500">
                  Already Have an Account, Please {" "}
                  <Link to = '/login'>Sign In now</Link>
                </span>
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default Register;