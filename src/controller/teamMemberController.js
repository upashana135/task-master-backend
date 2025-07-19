const prisma = require("../lib/prisma")
const { errorResponse, successResponse } = require("../lib/responseWrapper")

const teamMemberInvitation = async(req, res) => {
    try{
        const teamId = req.params.teamId 
        const team = await prisma.Team.findFirst({
            where: {id : teamId},
            select: {
                created_by : true
            }
        })
        if(req.user.userId !== Number(team.created_by)){
            return errorResponse(res, "Unauthorized!", 401)
        }
        const { member_email } = req.body
        const team_member = {team_id: Number(teamId), member_email : member_email}
        await prisma.TeamMember.create({data: team_member})
        return successResponse(res, null, "Invitation sent", 201)
    }catch(error){
        return errorResponse(res, "Something went wrong!", 501);
    }
}

const updateInvitation = async(req, res) =>{
    try{
        const memberId = req.params.memberId;
        const {invitation_status} = req.body;
        if(invitation_status === 'accepted'){
            await prisma.TeamMember.update({
                where: {id: memberId},
                data: {invitation_status : invitation_status}
            })
            return successResponse(res, null, "Invitation Accepted Successfully!", 201)
        }
        if(invitation_status === 'rejected'){
            await prisma.TeamMember.delete({
                where: {id:memberId}
            })
            return successResponse(res, null, "Invitation Rejected!", 201)
        }
    }catch(error){
        return errorResponse(res, "Something went wrong!", 501);
    }
}

const getTeamMemberByTeamId = async(req, res) =>{
    try{
        const {userEmail} = req.user
        const teamId = req.params.teamId
        const teamMembers = await prisma.TeamMember.findMany({
            where : { 
                team_id : teamId, 
                invitation_status: "accepted",
                member_email : {
                    not: userEmail
                }
            },
            select: {
                member_email : true
            }
        })
        return successResponse(res, teamMembers, "Team members retrieved successfully!", 201)
    }catch(error){
        return errorResponse(res, "Something went wrong!", 501);
    }
}

module.exports = {teamMemberInvitation, updateInvitation, getTeamMemberByTeamId}