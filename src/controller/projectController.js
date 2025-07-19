const prisma = require("../lib/prisma");
const { errorResponse, successResponse } = require("../lib/responseWrapper");
const { updateInvitation } = require("./teamMemberController");

const createProject = async(req, res) => {
    try{
        const userId = req.user.userId;
        const {name, description } = req.body.project;
        const teams = req.body.teams;
        if (!name) {
            return errorResponse(res, "Project name is required", 400);
        }
        if(teams.length < 1){
            return errorResponse(res, "Atleast one team is required", 400);
        }
        const created_at = new Date();
        await prisma.$transaction(async (tx) => {
            const newProject = await prisma.Project.create({
                data: {name: name, description: description, created_by : userId, created_at : created_at}
            })

            await tx.projectTeam.createMany({
                data: teams.map((team) => ({
                    team_id: parseInt(team.value),
                    project_id: newProject.id,
                })),
                skipDuplicates: false, 
            });
        })

        return successResponse(res, null, "Project created successfully", 201)
    }catch(error){
        console.log(error)
        return errorResponse(res, "Something went wrong!", 501)
    }
}

const getAllProjects = async(req, res) => {
    try{
        const {userId, userEmail} = req.user
        const teams = await prisma.Team.findMany({
            where : {
                teamMembers: {
                    some: {
                        member_email: userEmail,
                        invitation_status: "accepted",
                    }
                }
            },
            select : {
                id: true,
                name: true
            }
        })
        const projects = await prisma.Project.findMany({
            where: {created_by : userId},
            include: {
                project_teams: {
                    select: {
                        team : {
                            select: {
                                name: true,
                                description: true
                            }
                        }
                    }
                }
            }
        })
        const collaboratingProjects = await prisma.Project.findMany({
            where: {
                created_by : {
                    not: userId
                },
                project_teams: {
                    some: {
                        team: {
                            created_by: {
                                not: userId,
                            },
                            teamMembers: {
                                some: {
                                    member_email: userEmail,
                                },
                            },
                        },
                    },
                },
            },
            select: {
                id: true,
                name: true,
                description: true,
                created_by: true,
                created_at: true,
                project_teams: {
                    select: {
                        team: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });
        const results = {
            teams,
            projects,
            collaboratingProjects
        }
        return successResponse(res, results, "Fetched all projects successfully!", 201)
    }catch(error){
        console.log(error)
        return errorResponse(res, "Something went wrong!", 501)
    }
}

module.exports = {createProject, getAllProjects}