import { FaLock } from "react-icons/fa";
import { Link , useNavigate } from "react-router-dom";


//const navigate = useNavigate();

function Login() {
    return(
        <>
      <div className="grid grid-cols-1 sm:grid-cols-2 h-screen items-center place-items-center">
        <div className="flex justify-center">
          <img src={require("../assets/signup.jpg")} alt="" />
        </div>
        {/* Increased max-w-xl and p-14 for a larger input section */}
        <div className="w-full max-w-xl space-y-8 p-14 rounded-lg">
          {/* Center logo and heading together */}
          <div className="flex flex-col items-center justify-center">
            <img
              className="h-40 w-auto mb-2"
              src={require("../assets/logo.png")}
              alt="Your Company"
            />
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 font-mono text-center">
              Sign In  Test 
            </h2>
          </div>
          <form className="mt-8 space-y-6" >
            {/* <input type="hidden" name="remember" defaultValue="true" /> */}
            <div className="rounded-md shadow-sm space-y-6">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="relative block w-full rounded-md border-0 py-3 px-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-base sm:leading-6"
                  placeholder="Email address"
                 
                />
              </div>
              <div className="relative">
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="relative block w-full rounded-md border-0 py-3 px-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-base sm:leading-6"
                  placeholder="Password"
                />
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaLock className="text-gray-400" />
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Remember me
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
              >
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <FaLock className="h-5 w-5 text-cyan-200 group-hover:text-cyan-100" aria-hidden="true" />
                </span>
                <span className="ml-6">Sign in</span>
              </button>
              <p className="mt-2 text-center text-sm text-gray-600">
                Or{" "}
                <span className="font-medium text-indigo-600 hover:text-indigo-500">
                  Don't Have an Account, Please{" "}
                  <Link to="/register">Sign Up Now</Link>
                </span>
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
    );
}

export default Login;