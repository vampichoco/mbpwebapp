Imports System.Web
Imports System.Web.Services
Imports Newtonsoft.Json.Linq
Imports System.Web.Script.Serialization

Public Class dbstatus
    Implements System.Web.IHttpHandler

    Sub ProcessRequest(ByVal context As HttpContext) Implements IHttpHandler.ProcessRequest
        Dim db As New mbpDataContext

        Dim stat As New With {.exists = db.DatabaseExists, .dateTime = DateTime.Now}

        Dim json As New JavaScriptSerializer()
        context.Response.Write(json.Serialize(stat))

    End Sub

    ReadOnly Property IsReusable() As Boolean Implements IHttpHandler.IsReusable
        Get
            Return False
        End Get
    End Property

End Class