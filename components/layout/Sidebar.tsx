import React from "react";
import packageJson from "package.json";
import useLog from "lib/useLog";
import useConfig from "lib/useConfig";
import SidebarLink from "./SidebarLink";

const Sidebar = ({ open }: { open: boolean }): JSX.Element => {
    const { config } = useConfig();
    const { logData } = useLog();

    return (
        <div
            className={`bg-neutral-800 flex-col justify-between w-full md:w-auto lg:w-60 flex absolute md:relative min-h-mobilemain md:min-h-main z-40 ${
                open ? "-left-0" : "-left-full"
            } md:left-0 transition-all md:transition-none`}
        >
            <div className="flex flex-col">
                <ul>
                    <li>
                        <SidebarLink path="" label="Home" />
                    </li>
                    <li>
                        <SidebarLink
                            path="config"
                            label="Configuration"
                            textColor={`${config.keyValid ? "text-green-400" : "text-red-400"}`}
                        />
                    </li>
                    <li>
                        <SidebarLink path="logs" label="Logs" />
                    </li>
                    {/* <li>
                        <SidebarLink path="search" label="Advanced search" />
                    </li>
                    <li>
                        <SidebarLink path="categories" label="Categories" />
                    </li>
                    <li>
                        <SidebarLink path="trending" label="New & trending" />
                    </li>
                    <li>
                        <SidebarLink path="creators" label="Creators" />
                    </li> */}
                </ul>
                <hr className="border-neutral-900 my-1" />
                {logData.reportId ? (
                    <ul>
                        <li>
                            <SidebarLink
                                path="overview"
                                label="Fights Overview"
                                textColor={`${logData.rawReport ? "text-green-400" : "text-white"}`}
                            />
                        </li>
                        <li>
                            <SidebarLink
                                path="characters"
                                label="Characters Overview"
                                textColor={`${
                                    logData.processedReport ? "text-green-400" : "text-white"
                                }`}
                            />
                        </li>
                        {/* <li>
                        // I cbf making this the google sheets does a good job
                            <SidebarLink path="gear" label="Gear Issues" />
                        </li> */}
                        <li>
                            <SidebarLink path="breakdowns" label="Fight Breakdowns" />
                        </li>
                    </ul>
                ) : (
                    <p className="flex items-center py-2 px-4 gap-4 select-none text-white">
                        Open a log to continue
                    </p>
                )}
                <hr className="border-neutral-900 my-1" />
            </div>
            <div>
                <hr className="border-neutral-900 my-1" />
                <ul>
                    <li>
                        <SidebarLink
                            path="https://github.com/lachlansleight/wcl-splat"
                            label="GitHub repository"
                        />
                        <SidebarLink path="changelog" label="Changelog" />
                    </li>
                </ul>
                <hr className="border-neutral-900 my-1" />
                <ul>
                    <li>
                        <div className="my-2 px-4 flex-col hidden lg:flex">
                            <span className="text-neutral-500 text-sm">
                                SPLAT Version {packageJson.version}
                            </span>
                            <span className="text-neutral-500 text-sm">&copy; Selmek 2023</span>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Sidebar;
