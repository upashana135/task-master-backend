const prisma = require("../lib/prisma");
const { errorResponse, successResponse } = require("../lib/responseWrapper")

const createTeam = async(req, res) => {
    try{
        const {name, description } = req.body
        const {userId, userEmail} = req.user
        const created_at = new Date();
        const team = { name, created_by: userId, created_at : created_at, description : description};
        if (!name) {
            return errorResponse(res, "Team name is required", 400);
        }
        await prisma.$transaction(async (tx)=>{
            const newTeam = await prisma.Team.create({data: team});
            await tx.TeamMember.create({
                data: {
                    team_id : newTeam.id,
                    joined_date: new Date(),
                    invitation_status: "accepted",
                    member_email: userEmail
                }
            })
        })
        
        return successResponse(res, null, "Team created successfully", 201)
    }catch(error){
        console.log(error)
        return errorResponse(res, "Something went wrong!", 501);
    }
}

const getTeams = async(req, res) => {
    try{
        const {userId, userEmail} = req.user

        //all teams created by current user along with team members
        const teams = await prisma.Team.findMany({
            where : {
                created_by : userId
            },
            include: {
                teamMembers: {
                    where: {
                        member_email: {
                            not: userEmail
                        }
                    },
                    select : {
                        member_email: true,
                        invitation_status : true
                    }
                },
            },
        });

        //get all users except the current user
        const allUsers = await prisma.User.findMany({
            where: {
                NOT: {
                    id: userId
                }
            },
            select:{
                id: true,
                name: true, 
                email: true
            }
        });

        //process each team
        const teamWithUsers = teams.map(team => {
            const memberEmails = team.teamMembers.map(tm => tm.member_email);

            const invitedMembers = team.teamMembers.filter(tm => tm.invitation_status === 'invited');
            const acceptedMembers = team.teamMembers.filter(tm => tm.invitation_status === 'accepted');
            const notInvitedUsers = allUsers.filter(user => !memberEmails.includes(user.email));

            return {
                ...team,
                invitedMembers : invitedMembers,
                teamMembers : acceptedMembers,
                notInvitedUsers : notInvitedUsers
            };
        })

        //fetch teams where the current user is invited
        const invitedMemberships = await prisma.TeamMember.findMany({
            where: {
                member_email: userEmail,
                team : {
                    created_by: {
                        not: userId,
                    },
                }
            },
            include: {
                team: {
                    select: {
                        id: true,
                        name: true,
                        created_by: true,
                        created_at: true,
                        teamMembers: {
                            where: {
                                invitation_status: "accepted",
                                member_email: {
                                    not: userEmail
                                }
                            },
                            select: {
                                member_email: true,
                            },
                        },
                    },
                },
            },
        });

        const invitedTeams = await Promise.all(invitedMemberships.map(async entry => {
            const acceptedEmails = entry.team.teamMembers.map(tm => tm.member_email);

            const acceptedMembers = await prisma.user.findMany({
                where: {
                    email: { 
                        in: acceptedEmails 
                    },
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            });

            const creator = await prisma.user.findFirst({
                where: {
                    id: entry.team.created_by,
                },
                select: {
                    email: true,
                },
            });

            return {
                id: entry.team.id,
                name: entry.team.name,
                created_by: creator.email,
                created_at: entry.team.created_at,
                acceptedMembers,
                currentUserInvitationStatus: entry.invitation_status,
                member_id : entry.id,
            };
        }));

        const allTeam = {
            teamWithUsers,
            invitedTeams
        }
        
        return successResponse(res, allTeam, "Successful", 201)
    }catch(error){
        console.log(error)
        return errorResponse(res, "Something went wrong!", 501);
    }
}

const deleteATeam = async(req, res) => {
    try{
        const teamId = req.params.id
        const userId = req.user.userId
        const team = await prisma.Team.findUnique({where : {id: teamId}})
        if(userId !== Number(team.id)) {
            return errorResponse(res, "Unauthorised", 401)
        }
        await prisma.Team.delete({where: {id: teamId}})
        return successResponse(res, null, "Team deleted successfully", 201)
    }catch(error){
        return errorResponse(res, "Something went wrong!", 501);
    }
}


module.exports = {createTeam, getTeams, deleteATeam}