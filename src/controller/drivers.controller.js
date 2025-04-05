import { driverModels } from "../models/drivers.models.js";
import { uploadOnCloudinary } from "../services/uploadOnCloudinary.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
export const registerDriver = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      password,
      phoneNumber,
      dob,
      licenseNumber,
      vehicleModel,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !password ||
      !phoneNumber ||
      !dob ||
      !licenseNumber ||
      !vehicleModel
    ) {
      return res.status(400).json({ message: "Details missing" });
    }

    const existingDriver = await driverModels.findOne({ phoneNumber });
    if (existingDriver) {
      return res.status(407).json({ message: "Phone number already exists" });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const files = req.files;
    if (
      !files ||
      !files.profilePicture ||
      !files.vehicleFrontPicture ||
      !files.vehicleBackPicture
    ) {
      return res.status(400).json({ message: "All files are required" });
    }

    const profilePath = files.profilePicture[0].path;
    const vehicleFrontPicture = files.vehicleFrontPicture[0].path;
    const vehicleBackPicture = files.vehicleBackPicture[0].path;

    const profileUpload = await uploadOnCloudinary(
      profilePath,
      "roam/drivers/profilePictures"
    );
    const vehicleFrontPictureUpload = await uploadOnCloudinary(
      vehicleFrontPicture,
      "roam/drivers/vehicleFrontPictures"
    );
    const vehicleBackPictureUpload = await uploadOnCloudinary(
      vehicleBackPicture,
      "roam/drivers/vehicleBackPictures"
    );

    const newDriver = await driverModels.create({
      firstName,
      lastName,
      password: hashedPassword,
      phoneNumber,
      dob: new Date(dob),
      licenseNumber,
      vehicleModel,
      profilePicture: profileUpload.url,
      vehicleFrontPicture: vehicleFrontPictureUpload.url,
      vehicleBackPicture: vehicleBackPictureUpload.url,
      status: "pending",
    });

    res.status(200).json({ message: "Driver created", newDriver });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const signInDriver = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;
    if (!phoneNumber || !password) {
      return res.status(400).json({ message: "Details missing" });
    }
    const driver = await driverModels.findOne({ phoneNumber });
    if (!driver) {
      return res
        .status(407)
        .json({ message: "Driver not found invalid phone number" });
    }
    const isPasswordValid = await bcryptjs.compare(password, driver.password);
    if (!isPasswordValid) {
      return res.status(403).json({ message: "Invalid password" });
    }
    if (driver.status === "pending") {
      return res.status(401).json({ message: "You're not approved yet" });
    }
    const token = jwt.sign({ id: driver._id }, process.env.JWT_TOKEN_SECRET, {
      expiresIn: "10d",
    });

    const options = {
      httpOnly: true,
      secure: true,
    };
    res
      .status(200)
      .cookie("token", token, options)
      .json({ message: "Driver Logged In", driver });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};
export const logOutDriver = async (req, res) => {
  try {
    const options = {
      httpOnly: true,
      secure: true,
    };
    res
      .status(200)
      .clearCookie("token", options)
      .json({ message: "Driver logged out" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};
export const getAllDrivers = async (req, res) => {
  try {
    const allDrivers = await driverModels.find({ status: "approved" });
    res.status(200).json({ totalDrivers: allDrivers.length, allDrivers });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPendingDrivers = async (req, res) => {
  try {
    const pendingDrivers = await driverModels.find({ status: "pending" });
    res.status(200).json({ allDrivers: pendingDrivers.length, pendingDrivers });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
