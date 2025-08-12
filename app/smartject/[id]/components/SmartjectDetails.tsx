import React from "react";
import Image from "next/image";
import {
  Target,
  Lightbulb,
  Users,
  Cpu,
  Zap,
  Building,
  Factory,
  BriefcaseIcon,
  LinkIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mission } from "@/components/icons/Mission";
import { Scope } from "@/components/icons/Scope";
import { HowWorks } from "@/components/icons/HowWorks";
import { KeyDiff } from "@/components/icons/KeyDiff";
import { ProblemSolves } from "@/components/icons/ProblemSolves";
import { Audience } from "@/components/icons/Audience";
import { Architecture } from "@/components/icons/Architecture";
import { UseCases } from "@/components/icons/UseCases";
import { Industries } from "@/components/icons/Industries";
import { Functions } from "@/components/icons/Functions";
import { Link } from "@/components/icons/Link";
import { Team } from "@/components/icons/Team";

interface SmartjectDetailsProps {
  smartject: {
    image?: string;
    title: string;
    mission: string;
    problematics: string;
    scope: string;
    howItWorks: string;
    architecture: string;
    innovation: string;
    useCase: string;
    industries?: string[];
    businessFunctions?: string[];
    audience?: string[];
    teams?: string[];
    researchPapers?: Array<{
      title: string;
      url: string;
    }>;
  };
}

export function SmartjectDetails({ smartject }: SmartjectDetailsProps) {
  const detailSections = [
    {
      icon: <Mission className="h-5 w-5" />,
      title: "Mission",
      content: smartject.mission,
      color: "text-primary",
    },
    {
      icon: <Scope className="h-5 w-5" />,
      title: "Scope",
      content: smartject.scope,
      color: "text-red-500",
    },
    {
      icon: <HowWorks className="h-5 w-5 text-green-500" />,
      title: "How it works",
      content: smartject.howItWorks,
      color: "text-green-500",
    },
    {
      icon: <KeyDiff className="h-5 w-5" />,
      title: "Key differentiators",
      content: smartject.innovation,
      color: "text-purple-500",
    },
    {
      icon: <ProblemSolves className="h-5 w-5" />,
      title: "Problem it solves",
      content: smartject.problematics,
      color: "text-amber-500",
    },
    {
      icon: <Architecture className="h-5 w-5 text-blue-500" />,
      title: "High-Level System Architecture",
      content: smartject.architecture,
      color: "text-blue-500",
    },
    {
      icon: <UseCases className="h-5 w-5 text-cyan-500" />,
      title: "Use Cases",
      content: smartject.useCase,
      color: "text-cyan-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x relative">
        {[
          ...detailSections.map((section, index) => (
            <div key={`section-${index}`} className="relative px-1 py-1">
              {index !== 0 && index !== 1 && (
                <div className="absolute left-4 right-4 top-0 h-px bg-border" />
              )}

              <Card className="h-full border-none shadow-none pl-0">
                <CardHeader className="pb-3 pl-3">
                  <CardTitle className="flex items-center gap-2 text-base pl-0">
                    {section.icon}
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pl-3 pt-0">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {section.content}
                  </p>
                </CardContent>
              </Card>
            </div>
          )),
          // Industries
          <div key="industries" className="relative px-4 py-2">
            <div className="absolute left-4 right-4 top-0 h-px bg-border" />
            <Card className="h-full border-none shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Industries className="h-5 w-5 text-red-500" />
                  Industries
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {smartject.industries && smartject.industries?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {smartject.industries.map((industry, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {industry}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Not specified</p>
                )}
              </CardContent>
            </Card>
          </div>,
          // Business Functions
          <div key="functions" className="relative px-4 py-2">
            <div className="absolute left-4 right-4 top-0 h-px bg-border" />
            <Card className="h-full border-none shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Functions className="h-5 w-5 text-orange-500" />
                  Business Functions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {smartject.businessFunctions &&
                smartject.businessFunctions?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {smartject.businessFunctions.map((func, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {func}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Not specified</p>
                )}
              </CardContent>
            </Card>
          </div>,
          // Audience
          <div key="audience" className="relative px-4 py-2">
            <div className="absolute left-4 right-4 top-0 h-px bg-border" />
            <div className="absolute top-4 bottom-4 left-0 w-px bg-border hidden md:block" />
            <Card className="h-full border-none shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Audience className="h-5 w-5 text-blue-500" />
                  Users
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {smartject.audience && smartject.audience?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {smartject.audience.map((tech, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Not specified</p>
                )}
              </CardContent>
            </Card>
          </div>,
          // Teams
          <div key="teams" className="relative px-4 py-2">
            <div className="absolute left-4 right-4 top-0 h-px bg-border" />
            <Card className="h-full border-none shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Team className="h-5 w-5 text-green-500" />
                  Teams
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {smartject.teams && smartject.teams?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {smartject.teams.map((team, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {team}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Not specified</p>
                )}
              </CardContent>
            </Card>
          </div>,
          // Relevant Links
          <div key="links" className="relative px-4 py-2">
            <div className="absolute left-4 right-4 top-0 h-px bg-border" />
            <div className="absolute top-4 bottom-4 left-0 w-px bg-border hidden md:block" />
            <Card className="h-full border-none shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Link className="h-5 w-5 text-blue-500" />
                  Relevant Links
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {smartject.researchPapers &&
                smartject.researchPapers?.length > 0 ? (
                  <ul className="space-y-2">
                    {smartject.researchPapers.map((link, index) => (
                      <li key={index}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          {link.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Not specified</p>
                )}
              </CardContent>
            </Card>
          </div>,
        ]}
      </div>
    </div>
  );
}
